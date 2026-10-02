<?php

namespace Tests\Feature;

use App\Models\EmailLog;
use App\Models\PortalNotification;
use App\Models\Setting;
use App\Models\SmsLog;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class CommunicationsAndSettingsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_public_can_fetch_branding_settings(): void
    {
        $response = $this->getJson('/api/settings/public');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'site_name',
                'parent_website_url',
                'site_logo_url',
                'favicon_url',
                'email_logo_url',
                'primary_color',
            ]);

        $this->assertEquals('Watered', $response->json('site_name'));
        $this->assertEquals('http://mywatered.com/', $response->json('parent_website_url'));
    }

    public function test_admin_can_retrieve_settings_with_masked_secrets(): void
    {
        $admin = User::where('role', 'admin')->first();
        $token = $admin->createToken('test')->plainTextToken;

        Setting::set('smtp_password', 'secret_pass_123', 'smtp', true);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/admin/settings');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'settings' => [
                    'branding',
                    'smtp',
                    'sms',
                ]
            ]);

        $this->assertEquals('••••••••', $response->json('settings.smtp.smtp_password'));
    }

    public function test_admin_can_update_smtp_and_sms_settings(): void
    {
        $admin = User::where('role', 'admin')->first();
        $token = $admin->createToken('test')->plainTextToken;

        $payload = [
            'smtp' => [
                'smtp_host' => 'mail.mywatered.com',
                'smtp_port' => 587,
                'smtp_username' => 'gateway@mywatered.com',
                'smtp_from_address' => 'registry@mywatered.com',
                'smtp_from_name' => 'Watered Registry',
            ],
            'sms' => [
                'sms_enabled' => '1',
                'twilio_from_number' => '+18005550199',
            ],
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/admin/settings', $payload);

        $response->assertStatus(200);

        $this->assertEquals('mail.mywatered.com', Setting::get('smtp_host'));
        $this->assertEquals('+18005550199', Setting::get('twilio_from_number'));
    }

    public function test_email_tracking_pixel_increments_open_count(): void
    {
        $token = Str::random(32);
        $emailLog = EmailLog::create([
            'recipient_email' => 'member@example.org',
            'recipient_name' => 'Member Test',
            'subject' => 'Watered Admission Notice',
            'status' => 'sent',
            'tracking_token' => $token,
            'opens_count' => 0,
        ]);

        $response = $this->get("/api/track/email/{$token}.png");

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'image/png');

        $emailLog->refresh();
        $this->assertEquals('opened', $emailLog->status);
        $this->assertEquals(1, $emailLog->opens_count);
        $this->assertNotNull($emailLog->opened_at);
    }

    public function test_communications_stats_aggregates_open_rates(): void
    {
        $admin = User::where('role', 'admin')->first();
        $token = $admin->createToken('test')->plainTextToken;

        EmailLog::create([
            'recipient_email' => 'opened@example.org',
            'subject' => 'Subject 1',
            'status' => 'opened',
            'tracking_token' => Str::random(32),
            'opens_count' => 1,
        ]);

        EmailLog::create([
            'recipient_email' => 'unopened@example.org',
            'subject' => 'Subject 2',
            'status' => 'sent',
            'tracking_token' => Str::random(32),
            'opens_count' => 0,
        ]);

        SmsLog::create([
            'recipient_phone' => '+14155550199',
            'message_body' => 'Test SMS',
            'status' => 'delivered',
            'gateway' => 'twilio',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/admin/communications/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'email' => ['total_sent', 'opened', 'unopened', 'open_rate'],
                'sms' => ['total_sent', 'delivered', 'failed'],
                'registrations' => ['total', 'pending', 'approved', 'rejected'],
            ]);

        $this->assertEquals(2, $response->json('email.total_sent'));
        $this->assertEquals(1, $response->json('email.opened'));
        $this->assertEquals(50.0, $response->json('email.open_rate'));
    }

    public function test_notifications_endpoints_work_for_authenticated_users(): void
    {
        $admin = User::where('role', 'admin')->first();
        $token = $admin->createToken('test')->plainTextToken;

        $notif = PortalNotification::create([
            'user_id' => $admin->id,
            'type' => 'system',
            'title' => 'Test Notification',
            'message' => 'System alert body',
            'is_read' => false,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/notifications');

        $response->assertStatus(200)
            ->assertJsonStructure(['unread_count', 'notifications']);

        $this->assertGreaterThanOrEqual(1, $response->json('unread_count'));

        // Mark as read
        $markResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->patchJson("/api/notifications/{$notif->id}/read");

        $markResponse->assertStatus(200);

        $notif->refresh();
        $this->assertTrue($notif->is_read);
    }

    public function test_admin_can_manage_and_preview_email_templates(): void
    {
        $admin = User::where('role', 'admin')->first();
        $token = $admin->createToken('test')->plainTextToken;

        $template = \App\Models\EmailTemplate::firstOrCreate(
            ['code' => 'test_notice'],
            [
                'name' => 'Test Notice',
                'subject' => 'Notice for {{first_name}}',
                'body' => 'Hello {{first_name}}, your ID is {{member_number}}.',
                'variables' => ['first_name', 'member_number'],
                'is_active' => true,
            ]
        );

        // Fetch templates
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/admin/templates');

        $response->assertStatus(200)
            ->assertJsonStructure(['templates']);

        // Update template
        $updateResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->patchJson("/api/admin/templates/{$template->id}", [
                'subject' => 'Updated Notice for {{first_name}}',
                'body' => 'Welcome {{first_name}}, ID: {{member_number}}.',
                'is_active' => true,
            ]);

        $updateResponse->assertStatus(200);

        // Preview template
        $previewResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/admin/templates/{$template->id}/preview", [
                'first_name' => 'Kwame',
                'member_number' => 'W-999',
            ]);

        $previewResponse->assertStatus(200)
            ->assertJsonStructure(['rendered_subject', 'rendered_body', 'html']);

        $this->assertStringContainsString('Kwame', $previewResponse->json('rendered_subject'));
        $this->assertStringContainsString('W-999', $previewResponse->json('rendered_body'));
    }
}
