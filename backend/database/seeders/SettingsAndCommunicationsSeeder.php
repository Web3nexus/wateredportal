<?php

namespace Database\Seeders;

use App\Models\EmailLog;
use App\Models\PortalNotification;
use App\Models\Setting;
use App\Models\SmsLog;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SettingsAndCommunicationsSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Initial Settings
        $defaultSettings = [
            // Branding
            ['key' => 'site_name', 'value' => 'Watered', 'group' => 'branding', 'is_secret' => false],
            ['key' => 'parent_website_url', 'value' => 'http://mywatered.com/', 'group' => 'branding', 'is_secret' => false],
            ['key' => 'site_logo_url', 'value' => '', 'group' => 'branding', 'is_secret' => false],
            ['key' => 'favicon_url', 'value' => '', 'group' => 'branding', 'is_secret' => false],
            ['key' => 'email_logo_url', 'value' => '', 'group' => 'branding', 'is_secret' => false],
            ['key' => 'primary_color', 'value' => '#966922', 'group' => 'branding', 'is_secret' => false],

            // SMTP
            ['key' => 'smtp_host', 'value' => '127.0.0.1', 'group' => 'smtp', 'is_secret' => false],
            ['key' => 'smtp_port', 'value' => '1025', 'group' => 'smtp', 'is_secret' => false],
            ['key' => 'smtp_username', 'value' => '', 'group' => 'smtp', 'is_secret' => false],
            ['key' => 'smtp_password', 'value' => '', 'group' => 'smtp', 'is_secret' => true],
            ['key' => 'smtp_encryption', 'value' => 'tls', 'group' => 'smtp', 'is_secret' => false],
            ['key' => 'smtp_from_address', 'value' => 'noreply@mywatered.com', 'group' => 'smtp', 'is_secret' => false],
            ['key' => 'smtp_from_name', 'value' => 'Watered', 'group' => 'smtp', 'is_secret' => false],

            // SMS (Twilio)
            ['key' => 'sms_enabled', 'value' => '1', 'group' => 'sms', 'is_secret' => false],
            ['key' => 'sms_provider', 'value' => 'twilio', 'group' => 'sms', 'is_secret' => false],
            ['key' => 'twilio_account_sid', 'value' => 'AC_demo_sid_7392819034', 'group' => 'sms', 'is_secret' => false],
            ['key' => 'twilio_auth_token', 'value' => 'demo_token_secret_value', 'group' => 'sms', 'is_secret' => true],
            ['key' => 'twilio_from_number', 'value' => '+18005550199', 'group' => 'sms', 'is_secret' => false],
        ];

        foreach ($defaultSettings as $s) {
            Setting::updateOrCreate(
                ['key' => $s['key']],
                [
                    'value' => $s['value'],
                    'group' => $s['group'],
                    'is_secret' => $s['is_secret'],
                ]
            );
        }

        // 2. Demo Portal Notifications for Admin and Users
        $admin = User::where('role', 'admin')->first();
        if ($admin) {
            PortalNotification::firstOrCreate(
                ['title' => 'Portal Communication Gateway Initialized'],
                [
                    'user_id' => null, // Broadcast to administrators
                    'type' => 'system',
                    'title' => 'Portal Communication Gateway Initialized',
                    'message' => 'SMTP relay, Twilio SMS gateway, and open tracking telemetry have been activated.',
                    'action_url' => '/admin/settings',
                    'is_read' => false,
                    'created_at' => now()->subMinutes(15),
                ]
            );

            PortalNotification::firstOrCreate(
                ['title' => 'New Membership Application Submitted'],
                [
                    'user_id' => null,
                    'type' => 'registration',
                    'title' => 'New Membership Application Submitted',
                    'message' => 'An applicant submitted details for review into the Watered register.',
                    'action_url' => '/admin/applications',
                    'is_read' => false,
                    'created_at' => now()->subHours(1),
                ]
            );
        }

        // 3. Demo Email Logs (demonstrating opened, unopened, and tracking rates)
        if (EmailLog::count() === 0) {
            $demoEmails = [
                [
                    'recipient_email' => 'tadesse@example.org',
                    'recipient_name' => 'Tadesse Bekele',
                    'subject' => 'Official Admission into Watered Register',
                    'status' => 'opened',
                    'tracking_token' => Str::random(32),
                    'opened_at' => now()->subHours(2),
                    'opens_count' => 3,
                    'created_at' => now()->subHours(5),
                ],
                [
                    'recipient_email' => 'aminata@example.org',
                    'recipient_name' => 'Aminata Diallo',
                    'subject' => 'Welcome to Watered — Account Verification',
                    'status' => 'opened',
                    'tracking_token' => Str::random(32),
                    'opened_at' => now()->subHours(1),
                    'opens_count' => 1,
                    'created_at' => now()->subHours(4),
                ],
                [
                    'recipient_email' => 'kofi@example.org',
                    'recipient_name' => 'Kofi Mensah',
                    'subject' => 'Watered Notice: Annual Registry Confirmation',
                    'status' => 'sent', // unopened
                    'tracking_token' => Str::random(32),
                    'opened_at' => null,
                    'opens_count' => 0,
                    'created_at' => now()->subHours(3),
                ],
                [
                    'recipient_email' => 'zainab@example.org',
                    'recipient_name' => 'Zainab Conteh',
                    'subject' => 'Application Received — Watered Register',
                    'status' => 'opened',
                    'tracking_token' => Str::random(32),
                    'opened_at' => now()->subMinutes(45),
                    'opens_count' => 2,
                    'created_at' => now()->subHours(2),
                ],
                [
                    'recipient_email' => 'chidi@example.org',
                    'recipient_name' => 'Chidi Okonkwo',
                    'subject' => 'Watered Digital Credential Activated',
                    'status' => 'sent', // unopened
                    'tracking_token' => Str::random(32),
                    'opened_at' => null,
                    'opens_count' => 0,
                    'created_at' => now()->subHours(1),
                ],
            ];

            foreach ($demoEmails as $email) {
                EmailLog::create($email);
            }
        }

        // 4. Demo SMS Logs
        if (SmsLog::count() === 0) {
            $demoSms = [
                [
                    'recipient_phone' => '+14155552671',
                    'recipient_name' => 'Tadesse Bekele',
                    'message_body' => 'Watered Portal: Your membership credential has been activated. Access your digital ID card at http://mywatered.com/portal',
                    'status' => 'delivered',
                    'gateway' => 'twilio',
                    'external_id' => 'SM928374928172635489',
                    'created_at' => now()->subHours(5),
                ],
                [
                    'recipient_phone' => '+447911123456',
                    'recipient_name' => 'Aminata Diallo',
                    'message_body' => 'Watered Portal: Your verification code is 482910. Valid for 10 minutes.',
                    'status' => 'delivered',
                    'gateway' => 'twilio',
                    'external_id' => 'SM182736451928374650',
                    'created_at' => now()->subHours(4),
                ],
                [
                    'recipient_phone' => '+2348012345678',
                    'recipient_name' => 'Kofi Mensah',
                    'message_body' => 'Watered Portal: General Council bulletin available in your portal message inbox.',
                    'status' => 'delivered',
                    'gateway' => 'twilio',
                    'external_id' => 'SM847291038475620194',
                    'created_at' => now()->subHours(2),
                ],
                [
                    'recipient_phone' => '+12025550143',
                    'recipient_name' => 'Zainab Conteh',
                    'message_body' => 'Watered Portal: Welcome! Your application has been logged into the registry.',
                    'status' => 'delivered',
                    'gateway' => 'twilio',
                    'external_id' => 'SM384729104857201948',
                    'created_at' => now()->subHours(1),
                ],
            ];

            foreach ($demoSms as $sms) {
                SmsLog::create($sms);
            }
        }

        // 5. Default Email Templates
        $defaultTemplates = [
            [
                'code' => 'admission_approved',
                'name' => 'Official Admission Notice & Credentials',
                'subject' => 'Official Admission into Watered Register — Member ID: {{member_number}}',
                'body' => "Greetings {{first_name}},\n\nWe are pleased to inform you that your membership application ({{application_number}}) has been approved by the Administration.\n\nYour official Member ID is: {{member_number}}.\n\nYour digital membership card and encrypted portal access have been activated. You can access your credentials directly on the Watered Portal:\n{{portal_url}}\n\nWelcome to Watered.",
                'variables' => ['first_name', 'application_number', 'member_number', 'portal_url', 'site_name'],
                'is_active' => true,
            ],
            [
                'code' => 'application_received',
                'name' => 'Application Receipt Confirmation',
                'subject' => 'Watered Application Received — Reference: {{application_number}}',
                'body' => "Greetings {{first_name}},\n\nThank you for applying to the Watered register. Your application has been logged under reference number {{application_number}}.\n\nOur administration team is currently reviewing your application. You will be notified by email and SMS once a determination has been reached.\n\nIf you have any questions or need to submit additional documents, please visit:\n{{parent_website_url}}",
                'variables' => ['first_name', 'application_number', 'category_name', 'parent_website_url'],
                'is_active' => true,
            ],
            [
                'code' => 'verification_code',
                'name' => 'Security Verification Code',
                'subject' => 'Watered Security Verification Code: {{code}}',
                'body' => "Greetings {{first_name}},\n\nYour security verification code for the Watered Portal is:\n\n{{code}}\n\nThis code expires in 10 minutes. If you did not request this verification, please contact administration immediately.",
                'variables' => ['first_name', 'code', 'site_name'],
                'is_active' => true,
            ],
            [
                'code' => 'broadcast_announcement',
                'name' => 'General Member Announcement',
                'subject' => 'Watered Notice: {{subject}}',
                'body' => "Greetings {{first_name}},\n\nThe Administration has issued an official announcement for Watered members:\n\n{{message_body}}\n\nYou can review this bulletin and past messages in your portal at:\n{{portal_url}}/messages",
                'variables' => ['first_name', 'subject', 'message_body', 'portal_url'],
                'is_active' => true,
            ],
            [
                'code' => 'member_login_alert',
                'name' => 'Member Login Security Alert',
                'subject' => 'Watered Portal — Security Notice: Sign-in Alert',
                'body' => "Greetings {{name}},\n\nThis is an automated security notice to confirm that your Watered Portal account was signed into.\n\nSign-in details:\n• Date & Time: {{timestamp}}\n• IP Address: {{ip_address}}\n• Client / Device: {{user_agent}}\n\nIf this was you, you can disregard this notice.\nIf you did not authorize this session, please contact Watered Administration immediately.\n\nWatered Security Team\n{{parent_website_url}}",
                'variables' => ['name', 'email', 'timestamp', 'ip_address', 'user_agent', 'portal_url', 'site_name'],
                'is_active' => true,
            ],
            [
                'code' => 'membership_upgraded',
                'name' => 'Membership Tier Upgrade Notice',
                'subject' => 'Watered Notice: Membership Upgraded to {{category_name}} Tier',
                'body' => "Greetings {{first_name}},\n\nWe are pleased to inform you that your Watered membership standing has been officially upgraded to {{category_name}} standing.\n\nYour verified digital pass and membership privileges have been refreshed across the register.\n{{reason_section}}\nView your updated executive card at:\n{{portal_url}}/dashboard\n\nWatered Administration Council",
                'variables' => ['first_name', 'member_number', 'category_name', 'reason_section', 'portal_url', 'site_name'],
                'is_active' => true,
            ],
        ];

        foreach ($defaultTemplates as $t) {
            \App\Models\EmailTemplate::updateOrCreate(
                ['code' => $t['code']],
                $t
            );
        }

        // 6. Default Sending Email Accounts (Type 2 Engine: Multiple Senders for Messaging)
        if (\App\Models\SendingEmailAccount::count() === 0) {
            \App\Models\SendingEmailAccount::create([
                'name' => 'Watered Executive Secretariat',
                'from_name' => 'Watered Executive Office',
                'from_email' => 'executive@mywatered.com',
                'reply_to_email' => 'contact@mywatered.com',
                'smtp_host' => '127.0.0.1',
                'smtp_port' => 1025,
                'smtp_username' => null,
                'smtp_password' => null,
                'smtp_encryption' => 'none',
                'is_default' => true,
                'is_active' => true,
                'description' => 'Primary outbound mailer for presidential orders, official decrees, and executive communiqués.',
            ]);

            \App\Models\SendingEmailAccount::create([
                'name' => 'Member Relations & Engagement',
                'from_name' => 'Watered Member Services',
                'from_email' => 'members@mywatered.com',
                'reply_to_email' => 'support@mywatered.com',
                'smtp_host' => '127.0.0.1',
                'smtp_port' => 1025,
                'smtp_username' => null,
                'smtp_password' => null,
                'smtp_encryption' => 'none',
                'is_default' => false,
                'is_active' => true,
                'description' => 'Dedicated sender account for general member engagement, benefits notices, and community bulletins.',
            ]);

            \App\Models\SendingEmailAccount::create([
                'name' => 'Events & Council Dispatch',
                'from_name' => 'Watered Events Council',
                'from_email' => 'events@mywatered.com',
                'reply_to_email' => 'events@mywatered.com',
                'smtp_host' => '127.0.0.1',
                'smtp_port' => 1025,
                'smtp_username' => null,
                'smtp_password' => null,
                'smtp_encryption' => 'none',
                'is_default' => false,
                'is_active' => true,
                'description' => 'Used exclusively for gathering alerts, global summits, and symposium announcements.',
            ]);
        }
    }
}
