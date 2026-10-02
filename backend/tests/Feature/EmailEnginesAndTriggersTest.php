<?php

namespace Tests\Feature;

use App\Models\EmailLog;
use App\Models\Member;
use App\Models\MemberProfile;
use App\Models\MembershipApplication;
use App\Models\MembershipCategory;
use App\Models\SendingEmailAccount;
use App\Models\User;
use Database\Seeders\SettingsAndCommunicationsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmailEnginesAndTriggersTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected MembershipCategory $category;
    protected MembershipCategory $vipCategory;
    protected SendingEmailAccount $account;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(SettingsAndCommunicationsSeeder::class);

        $this->admin = User::factory()->create([
            'role' => 'admin',
            'status' => 'active',
            'password' => bcrypt('AdminPassword123!'),
        ]);

        $this->category = MembershipCategory::create([
            'name' => 'General Registry',
            'code' => 'general',
            'badge_color' => '#2563eb',
            'rank' => 1,
            'is_active' => true,
        ]);

        $this->vipCategory = MembershipCategory::create([
            'name' => 'Diplomatic Tier',
            'code' => 'diplomatic',
            'badge_color' => '#d4af37',
            'rank' => 5,
            'is_active' => true,
        ]);

        $this->account = SendingEmailAccount::first() ?: SendingEmailAccount::create([
            'name' => 'Executive Office',
            'from_name' => 'Watered Secretariat',
            'from_email' => 'secretariat@mywatered.com',
            'smtp_host' => '127.0.0.1',
            'smtp_port' => 1025,
            'smtp_encryption' => 'none',
            'is_default' => true,
            'is_active' => true,
        ]);
    }

    public function test_user_signup_dispatches_waiting_for_approval_email(): void
    {
        $initialLogsCount = EmailLog::where('metadata->type', 'signup_pending_approval')->count();

        $response = $this->postJson('/api/applications', [
            'membership_category_id' => $this->category->id,
            'first_name' => 'Eleanor',
            'last_name' => 'Vane',
            'email' => 'eleanor.vane@example.com',
            'phone' => '+15552345678',
            'current_location' => 'Nairobi, Kenya',
            'occupation' => 'Agronomist',
            'workplace' => 'Global Water Initiative',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('membership_applications', [
            'email' => 'eleanor.vane@example.com',
            'status' => 'pending',
        ]);

        $newLogsCount = EmailLog::where('metadata->type', 'signup_pending_approval')->count();
        $this->assertEquals($initialLogsCount + 1, $newLogsCount);

        $latestLog = EmailLog::where('metadata->type', 'signup_pending_approval')->latest()->first();
        $this->assertEquals('eleanor.vane@example.com', $latestLog->recipient_email);
        $this->assertStringContainsString('Application Received', $latestLog->subject);
    }

    public function test_application_approval_dispatches_credentials_email(): void
    {
        $app = MembershipApplication::create([
            'application_number' => 'APP-2026-TEST01',
            'membership_category_id' => $this->category->id,
            'first_name' => 'Kofi',
            'last_name' => 'Annan',
            'email' => 'kofi.annan@example.com',
            'phone' => '+233201234567',
            'current_location' => 'Accra, Ghana',
            'occupation' => 'Diplomat',
            'workplace' => 'International Water Forum',
            'status' => 'pending',
        ]);

        $initialLogsCount = EmailLog::where('metadata->type', 'application_approved')->count();

        $response = $this->actingAs($this->admin)->postJson("/api/admin/applications/{$app->id}/approve", [
            'initial_password' => 'SecurePass2026!',
            'review_notes' => 'Credentials verified by committee.',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('members', [
            'status' => 'active',
        ]);

        $newLogsCount = EmailLog::where('metadata->type', 'application_approved')->count();
        $this->assertEquals($initialLogsCount + 1, $newLogsCount);

        $log = EmailLog::where('metadata->type', 'application_approved')->latest()->first();
        $this->assertEquals('kofi.annan@example.com', $log->recipient_email);
        $this->assertStringContainsString('Official Admission', $log->subject);
    }

    public function test_member_login_dispatches_login_alert_email(): void
    {
        $user = User::factory()->create([
            'role' => 'member',
            'status' => 'active',
            'password' => bcrypt('MemberPassword123!'),
            'email' => 'member.login.test@example.com',
        ]);

        $initialLogsCount = EmailLog::where('metadata->type', 'login_security_alert')->count();

        $response = $this->postJson('/api/auth/login', [
            'email' => 'member.login.test@example.com',
            'password' => 'MemberPassword123!',
        ]);

        $response->assertStatus(200);

        $newLogsCount = EmailLog::where('metadata->type', 'login_security_alert')->count();
        $this->assertEquals($initialLogsCount + 1, $newLogsCount);

        $log = EmailLog::where('metadata->type', 'login_security_alert')->latest()->first();
        $this->assertEquals('member.login.test@example.com', $log->recipient_email);
        $this->assertStringContainsString('Sign-in Alert', $log->subject);
    }

    public function test_member_tier_upgrade_dispatches_upgrade_email(): void
    {
        $user = User::factory()->create([
            'role' => 'member',
            'status' => 'active',
            'email' => 'upgrade.member@example.com',
        ]);

        $member = Member::create([
            'user_id' => $user->id,
            'membership_category_id' => $this->category->id,
            'member_number' => 'W-000999',
            'secure_qr_id' => 'sec_w_test999',
            'status' => 'active',
        ]);

        MemberProfile::create([
            'member_id' => $member->id,
            'first_name' => 'Sarah',
            'last_name' => 'Connor',
        ]);

        $initialLogsCount = EmailLog::where('metadata->type', 'membership_upgraded')->count();

        $response = $this->actingAs($this->admin)->patchJson("/api/admin/members/{$member->id}/category", [
            'membership_category_id' => $this->vipCategory->id,
            'reason' => 'Promotion to Diplomatic council standing.',
        ]);

        $response->assertStatus(200);

        $newLogsCount = EmailLog::where('metadata->type', 'membership_upgraded')->count();
        $this->assertEquals($initialLogsCount + 1, $newLogsCount);

        $log = EmailLog::where('metadata->type', 'membership_upgraded')->latest()->first();
        $this->assertEquals('upgrade.member@example.com', $log->recipient_email);
        $this->assertStringContainsString('Diplomatic Tier', $log->subject);
    }

    public function test_admin_can_manage_multiple_sending_accounts(): void
    {
        // 1. List accounts
        $res = $this->actingAs($this->admin)->getJson('/api/admin/sending-accounts');
        $res->assertStatus(200);
        $this->assertGreaterThanOrEqual(1, count($res->json('accounts')));

        // 2. Create a new sending account
        $createRes = $this->actingAs($this->admin)->postJson('/api/admin/sending-accounts', [
            'name' => 'Press & Public Affairs',
            'from_name' => 'Watered Media Office',
            'from_email' => 'press@mywatered.com',
            'reply_to_email' => 'media@mywatered.com',
            'smtp_host' => 'smtp.mailtrap.io',
            'smtp_port' => 2525,
            'smtp_username' => 'test_user',
            'smtp_password' => 'secret123',
            'smtp_encryption' => 'tls',
            'is_default' => false,
            'is_active' => true,
        ]);

        $createRes->assertStatus(201);
        $accountId = $createRes->json('account.id');
        $this->assertDatabaseHas('sending_email_accounts', [
            'id' => $accountId,
            'from_email' => 'press@mywatered.com',
        ]);

        // Verify password is masked in output
        $this->assertEquals('••••••••', $createRes->json('account.smtp_password'));

        // 3. Set as default
        $defRes = $this->actingAs($this->admin)->postJson("/api/admin/sending-accounts/{$accountId}/default");
        $defRes->assertStatus(200);
        $this->assertTrue($defRes->json('account.is_default'));
    }

    public function test_send_message_uses_selected_sending_account(): void
    {
        $user = User::factory()->create([
            'role' => 'member',
            'status' => 'active',
            'email' => 'msg.recipient@example.com',
        ]);

        $member = Member::create([
            'user_id' => $user->id,
            'membership_category_id' => $this->category->id,
            'member_number' => 'W-000888',
            'secure_qr_id' => 'sec_w_test888',
            'status' => 'active',
        ]);

        MemberProfile::create([
            'member_id' => $member->id,
            'first_name' => 'Leo',
            'last_name' => 'Tolstoy',
        ]);

        $response = $this->actingAs($this->admin)->postJson('/api/admin/messages', [
            'subject' => 'Watered Annual Council Conclave',
            'body' => 'All active delegates are invited to participate in the spring summit.',
            'target_type' => 'individual',
            'target_member_id' => $member->id,
            'sending_account_id' => $this->account->id,
            'send_email' => true,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('messages', [
            'subject' => 'Watered Annual Council Conclave',
            'sending_account_id' => $this->account->id,
        ]);

        $log = EmailLog::where('recipient_email', 'msg.recipient@example.com')->latest()->first();
        $this->assertNotNull($log);
        $this->assertEquals('Watered Notice: Watered Annual Council Conclave', $log->subject);
        $this->assertEquals($this->account->id, $log->metadata['account_id']);
    }

    public function test_setting_falls_back_to_env_when_empty_and_builds_proper_transports(): void
    {
        \App\Models\Setting::set('smtp_host', '', 'smtp');
        $this->assertEquals('fallback.host.com', \App\Models\Setting::get('smtp_host', 'fallback.host.com'));

        // Port 587 STARTTLS
        $transport587 = \App\Services\EmailService::buildTransport('mail.example.com', 587, 'tls', 'usr', 'pwd');
        $this->assertFalse($transport587->getStream()->isTLS());
        $this->assertTrue($transport587->isAutoTls());

        // Port 465 SMTPS (direct SSL)
        $transport465 = \App\Services\EmailService::buildTransport('mail.example.com', 465, 'ssl', 'usr', 'pwd');
        $this->assertTrue($transport465->getStream()->isTLS());
        $this->assertFalse($transport465->isAutoTls());
    }

    public function test_application_contact_required_and_rejection_dispatch_emails(): void
    {
        $app = MembershipApplication::create([
            'application_number' => 'APP-TEST-REQINFO',
            'membership_category_id' => $this->category->id,
            'status' => 'pending',
            'first_name' => 'Gregor',
            'last_name' => 'Samsa',
            'email' => 'gregor.samsa@example.org',
            'phone' => '+1555987654',
            'current_location' => 'Metropolis, Countryland',
            'occupation' => 'Salesman',
            'workplace' => 'Prague Textiles',
        ]);

        // 1. Request Info / Contact Details
        $reqResponse = $this->actingAs($this->admin)->postJson("/api/admin/applications/{$app->id}/request-info", [
            'review_notes' => 'Please provide proof of official address and passport scan.',
        ]);

        $reqResponse->assertStatus(200);
        $this->assertDatabaseHas('membership_applications', [
            'id' => $app->id,
            'status' => 'contact_required',
            'review_notes' => 'Please provide proof of official address and passport scan.',
        ]);

        $logReq = EmailLog::where('recipient_email', 'gregor.samsa@example.org')
            ->where('metadata->type', 'application_contact_required')
            ->first();
        $this->assertNotNull($logReq);
        $this->assertStringContainsString('APP-TEST-REQINFO', $logReq->subject);

        // 2. Reject Application
        $rejResponse = $this->actingAs($this->admin)->postJson("/api/admin/applications/{$app->id}/reject", [
            'review_notes' => 'Ineligible according to council bylaws.',
        ]);

        $rejResponse->assertStatus(200);
        $this->assertDatabaseHas('membership_applications', [
            'id' => $app->id,
            'status' => 'rejected',
        ]);

        $logRej = EmailLog::where('recipient_email', 'gregor.samsa@example.org')
            ->where('metadata->type', 'application_rejected')
            ->first();
        $this->assertNotNull($logRej);
        $this->assertStringContainsString('APP-TEST-REQINFO', $logRej->subject);
    }
}

