<?php

namespace Tests\Feature;

use App\Models\Member;
use App\Models\MembershipApplication;
use App\Models\MembershipCategory;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ApplicationsAndMembersCrudTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected string $adminToken;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->admin = User::where('role', 'admin')->first();
        $this->adminToken = $this->admin->createToken('admin_test')->plainTextToken;
        Mail::fake();
    }

    public function test_admin_can_crud_applications(): void
    {
        $category = MembershipCategory::first();

        // 1. Create application
        $createRes = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/admin/applications', [
                'first_name' => 'Amara',
                'last_name' => 'Diallo',
                'email' => 'amara.diallo@example.com',
                'phone' => '+221 77 123 4567',
                'membership_category_id' => $category->id,
                'occupation' => 'Renewable Energy Analyst',
                'workplace' => 'Dakar Solar',
                'current_location' => 'Dakar, Senegal',
                'status' => 'pending',
            ]);

        $createRes->assertStatus(201);
        $appId = $createRes->json('application.id');
        $this->assertNotNull($appId);
        $this->assertDatabaseHas('membership_applications', ['email' => 'amara.diallo@example.com']);

        // 2. Read application
        $readRes = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson("/api/admin/applications/{$appId}");
        $readRes->assertStatus(200)
            ->assertJsonPath('application.email', 'amara.diallo@example.com');

        // 3. Update application
        $updateRes = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->patchJson("/api/admin/applications/{$appId}", [
                'first_name' => 'Amara',
                'last_name' => 'Diallo-Ba',
                'email' => 'amara.updated@example.com',
                'phone' => '+221 77 999 8888',
                'review_notes' => 'Verified passport details.',
            ]);
        $updateRes->assertStatus(200);
        $this->assertDatabaseHas('membership_applications', [
            'id' => $appId,
            'last_name' => 'Diallo-Ba',
            'email' => 'amara.updated@example.com',
        ]);

        // 4. Delete application
        $deleteRes = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->deleteJson("/api/admin/applications/{$appId}");
        $deleteRes->assertStatus(200);
        $this->assertDatabaseMissing('membership_applications', ['id' => $appId]);
    }

    public function test_approved_application_disappears_from_active_applications_table_and_exists_in_members(): void
    {
        $category = MembershipCategory::first();

        // Create pending application
        $app = MembershipApplication::create([
            'application_number' => 'APP-AUTOTRANSFER',
            'membership_category_id' => $category->id,
            'first_name' => 'Fatou',
            'last_name' => 'Ndiaye',
            'email' => 'fatou.ndiaye@example.com',
            'phone' => '+221 70 555 4433',
            'date_of_birth' => '1990-01-01',
            'current_location' => 'Thiès, Senegal',
            'occupation' => 'Agronomist',
            'workplace' => 'AgriTech Hub',
            'status' => 'pending',
            'submitted_at' => now(),
        ]);

        // Query default active applications table -> Fatou should be visible
        $activeRes = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/admin/applications');
        $activeRes->assertStatus(200);
        $activeEmails = collect($activeRes->json('applications.data'))->pluck('email')->all();
        $this->assertContains('fatou.ndiaye@example.com', $activeEmails);

        // Approve application
        $approveRes = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson("/api/admin/applications/{$app->id}/approve", [
                'review_notes' => 'Approved by high council.',
            ]);
        $approveRes->assertStatus(200);
        $memberNumber = $approveRes->json('member_number');
        $this->assertNotNull($memberNumber);

        // Query default active applications table again -> Fatou MUST DISAPPEAR
        $activeAfterApprovalRes = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/admin/applications');
        $activeAfterApprovalRes->assertStatus(200);
        $activeEmailsAfter = collect($activeAfterApprovalRes->json('applications.data'))->pluck('email')->all();
        $this->assertNotContains('fatou.ndiaye@example.com', $activeEmailsAfter);

        // Verify member is in the Member Directory
        $membersRes = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/admin/members?search=' . urlencode('Fatou Ndiaye'));
        $membersRes->assertStatus(200);
        $memberEmails = collect($membersRes->json('members.data'))->pluck('user.email')->all();
        $this->assertContains('fatou.ndiaye@example.com', $memberEmails);
    }

    public function test_admin_can_crud_members_in_registry(): void
    {
        $category = MembershipCategory::first();

        // 1. Direct Member Registration
        $createRes = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/admin/members', [
                'first_name' => 'Tariq',
                'last_name' => 'El-Mansour',
                'email' => 'tariq.mansour@example.com',
                'phone' => '+212 61 234 5678',
                'membership_category_id' => $category->id,
                'status' => 'active',
                'occupation' => 'Hydrologist',
                'workplace' => 'Atlas Basin Water',
                'current_location' => 'Marrakech, Morocco',
                'valid_until' => '2028-12-31',
                'bio' => 'Senior hydrology engineer.',
            ]);

        $createRes->assertStatus(201);
        $memberId = $createRes->json('member.id');
        $this->assertNotNull($memberId);
        $this->assertDatabaseHas('users', ['email' => 'tariq.mansour@example.com']);
        $this->assertDatabaseHas('members', ['id' => $memberId]);

        // 2. Read Member
        $readRes = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson("/api/admin/members/{$memberId}");
        $readRes->assertStatus(200)
            ->assertJsonPath('member.user.email', 'tariq.mansour@example.com');

        // 3. Update Member
        $updateRes = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->patchJson("/api/admin/members/{$memberId}", [
                'first_name' => 'Tariq',
                'last_name' => 'El-Mansour (Updated)',
                'email' => 'tariq.updated@example.com',
                'occupation' => 'Chief Hydrologist',
                'valid_until' => '2030-01-01',
            ]);
        $updateRes->assertStatus(200);
        $this->assertDatabaseHas('users', ['email' => 'tariq.updated@example.com', 'name' => 'Tariq El-Mansour (Updated)']);
        $this->assertDatabaseHas('members', ['id' => $memberId, 'valid_until' => '2030-01-01 00:00:00']);

        // 4. Delete Member
        $deleteRes = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->deleteJson("/api/admin/members/{$memberId}");
        $deleteRes->assertStatus(200);

        // Verify member, profile, and user records are cleanly deleted
        $this->assertDatabaseMissing('members', ['id' => $memberId]);
        $this->assertDatabaseMissing('users', ['email' => 'tariq.updated@example.com']);
    }

    public function test_admin_can_bulk_approve_and_bulk_delete_applications(): void
    {
        $category = MembershipCategory::first();

        // Create 3 applications
        $app1 = MembershipApplication::create([
            'application_number' => 'APP-BULK1',
            'membership_category_id' => $category->id,
            'first_name' => 'User',
            'last_name' => 'One',
            'email' => 'bulk1@example.com',
            'phone' => '+1111111111',
            'current_location' => 'Lagos',
            'occupation' => 'Engineer',
            'workplace' => 'WaterTech',
            'status' => 'pending',
            'submitted_at' => now(),
        ]);

        $app2 = MembershipApplication::create([
            'application_number' => 'APP-BULK2',
            'membership_category_id' => $category->id,
            'first_name' => 'User',
            'last_name' => 'Two',
            'email' => 'bulk2@example.com',
            'phone' => '+2222222222',
            'current_location' => 'Abuja',
            'occupation' => 'Scientist',
            'workplace' => 'Hydrology Lab',
            'status' => 'pending',
            'submitted_at' => now(),
        ]);

        $app3 = MembershipApplication::create([
            'application_number' => 'APP-BULK3',
            'membership_category_id' => $category->id,
            'first_name' => 'User',
            'last_name' => 'Three',
            'email' => 'bulk3@example.com',
            'phone' => '+3333333333',
            'current_location' => 'Accra',
            'occupation' => 'Agronomist',
            'workplace' => 'Green Valley',
            'status' => 'pending',
            'submitted_at' => now(),
        ]);

        // Bulk Approve app1 and app2
        $bulkApproveRes = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/admin/applications/bulk-approve', [
                'ids' => [$app1->id, $app2->id],
                'review_notes' => 'Bulk verified.',
            ]);
        $bulkApproveRes->assertStatus(200)
            ->assertJsonPath('approved_count', 2);

        $this->assertEquals('approved', $app1->fresh()->status);
        $this->assertEquals('approved', $app2->fresh()->status);
        $this->assertEquals('pending', $app3->fresh()->status);

        // Bulk Delete app3
        $bulkDeleteRes = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/admin/applications/bulk-delete', [
                'ids' => [$app3->id],
            ]);
        $bulkDeleteRes->assertStatus(200)
            ->assertJsonPath('count', 1);

        $this->assertDatabaseMissing('membership_applications', ['id' => $app3->id]);
    }

    public function test_admin_can_bulk_manage_members_and_send_messages_to_multiple_recipients(): void
    {
        $members = Member::where('status', 'active')->take(2)->get();
        $this->assertGreaterThanOrEqual(2, $members->count());
        $ids = $members->pluck('id')->all();

        // 1. Bulk suspend
        $bulkStatusRes = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/admin/members/bulk-status', [
                'ids' => $ids,
                'status' => 'suspended',
            ]);
        $bulkStatusRes->assertStatus(200);

        foreach ($ids as $id) {
            $this->assertEquals('suspended', Member::find($id)->status);
        }

        // 2. Bulk activate
        $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/admin/members/bulk-status', [
                'ids' => $ids,
                'status' => 'active',
            ])->assertStatus(200);

        // 3. Message multiple selected members
        $messageRes = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/admin/messages', [
                'subject' => 'Notice for Multiple Selected Members',
                'body' => 'This is a dedicated notice.',
                'target_type' => 'multiple',
                'target_member_ids' => $ids,
            ]);

        $messageRes->assertStatus(201)
            ->assertJsonPath('recipient_count', 2);
    }
}
