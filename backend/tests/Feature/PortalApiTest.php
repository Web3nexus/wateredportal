<?php

namespace Tests\Feature;

use App\Models\Member;
use App\Models\MembershipApplication;
use App\Models\MembershipCategory;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortalApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_public_can_fetch_active_membership_categories(): void
    {
        $response = $this->getJson('/api/categories');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'categories' => [
                    '*' => ['id', 'name', 'code', 'description', 'badge_color', 'rank']
                ]
            ]);

        $this->assertGreaterThanOrEqual(7, count($response->json('categories')));
    }

    public function test_candidate_can_submit_membership_application(): void
    {
        $category = MembershipCategory::where('code', 'watered')->first();

        $payload = [
            'membership_category_id' => $category->id,
            'first_name' => 'Kweku',
            'last_name' => 'Addae',
            'email' => 'kweku@example.com',
            'phone' => '+233 24 123 4567',
            'date_of_birth' => '1992-05-15',
            'place_of_birth' => 'Kumasi, Ghana',
            'current_location' => 'Accra, Ghana',
            'occupation' => 'Agronomist',
            'workplace' => 'Volta Heritage Agro',
            'personal_statement' => 'Committed to advancing sovereign water and agricultural security.',
        ];

        $response = $this->postJson('/api/applications', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'application' => ['application_number', 'status', 'submitted_at']
            ]);

        $this->assertDatabaseHas('membership_applications', [
            'email' => 'kweku@example.com',
            'status' => 'pending',
        ]);
    }

    public function test_public_qr_verification_returns_only_approved_fields_and_no_private_data(): void
    {
        $member = Member::where('member_number', 'MW-000123')->first();

        $response = $this->getJson("/api/verify/{$member->secure_qr_id}");

        $response->assertStatus(200)
            ->assertJson([
                'verified' => true,
                'member' => [
                    'member_number' => 'MW-000123',
                    'status' => 'active',
                    'full_name' => 'Kofi Mensah',
                    'category_name' => $member->category->name,
                ]
            ]);

        $json = $response->json();
        $this->assertArrayNotHasKey('phone', $json['member']);
        $this->assertArrayNotHasKey('email', $json['member']);
        $this->assertArrayNotHasKey('date_of_birth', $json['member']);
        $this->assertArrayNotHasKey('workplace', $json['member']);
        $this->assertArrayNotHasKey('place_of_birth', $json['member']);
    }

    public function test_invalid_qr_verification_returns_404(): void
    {
        $response = $this->getJson('/api/verify/invalid-non-existent-hash');
        $response->assertStatus(404)
            ->assertJson([
                'verified' => false,
            ]);
    }

    public function test_member_authentication_and_card_retrieval(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'member@mywater.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'token',
                'user' => ['id', 'name', 'email', 'role', 'member']
            ]);

        $token = $response->json('token');

        $cardResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/member/card');

        $cardResponse->assertStatus(200)
            ->assertJson([
                'card' => [
                    'member_number' => 'MW-000123',
                    'full_name' => 'Kofi Mensah',
                    'status' => 'active',
                ]
            ]);

        $inboxResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/member/messages');

        $inboxResponse->assertStatus(200)
            ->assertJsonStructure([
                'messages',
                'unread_count',
            ]);
    }

    public function test_admin_dashboard_and_application_approval_flow(): void
    {
        $loginResponse = $this->postJson('/api/auth/securegate', [
            'email' => 'admin@mywater.com',
            'password' => 'password',
        ]);

        $token = $loginResponse->json('token');

        $dashboardResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/dashboard');

        $dashboardResponse->assertStatus(200)
            ->assertJsonStructure([
                'stats' => ['active_members', 'pending_applications', 'total_messages'],
                'category_distribution',
                'recent_applications',
                'recent_audits',
            ]);

        $application = MembershipApplication::where('application_number', 'APP-2026-00412')->first();

        $approveResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/admin/applications/{$application->id}/approve", [
                'review_notes' => 'Vetted and admitted into Chokwe Initiates.',
            ]);

        $approveResponse->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'member_number',
                'member_id',
                'temporary_credentials',
            ]);

        $application->refresh();
        $this->assertEquals('approved', $application->status);
        $this->assertNotNull($application->user_id);

        $member = Member::where('user_id', $application->user_id)->first();
        $this->assertNotNull($member);
        $this->assertEquals('active', $member->status);
    }

    public function test_admin_broadcast_message_dispatch(): void
    {
        $admin = User::where('email', 'admin@mywater.com')->first();
        $token = $admin->createToken('test_admin')->plainTextToken;

        $preview = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/admin/messages/preview', [
                'target_type' => 'all',
            ]);

        $preview->assertStatus(200);
        $this->assertGreaterThan(0, $preview->json('count'));

        $broadcast = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/admin/messages', [
                'subject' => 'Council Decreed Orientation Notice',
                'body' => 'Important procedural instructions for all members.',
                'target_type' => 'all',
                'priority' => 'high',
            ]);

        $broadcast->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'message_id',
                'recipient_count',
            ]);
    }
}
