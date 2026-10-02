<?php

namespace App\Services;

use App\Models\EmailLog;
use App\Models\EmailTemplate;
use App\Models\Member;
use App\Models\MembershipApplication;
use App\Models\MembershipCategory;
use App\Models\Message;
use App\Models\SendingEmailAccount;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Mail\Mailer as LaravelMailer;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\Mailer\Transport\Smtp\EsmtpTransport;

class EmailService
{
    /**
     * Build a robust SMTP transport handling both STARTTLS (port 587/25) and SMTPS (port 465)
     */
    public static function buildTransport(
        string $host,
        int $port = 587,
        ?string $encryption = 'tls',
        ?string $username = null,
        ?string $password = null
    ): EsmtpTransport {
        // Auto-correct in case parameters were passed in ($host, $port, $username, $password, $encryption) order
        if (
            (is_string($encryption) && str_contains($encryption, '@')) ||
            (is_string($password) && in_array(strtolower($password), ['tls', 'ssl', 'smtps', 'starttls', 'none', 'null']))
        ) {
            $realUsername = $encryption;
            $realPassword = $username;
            $realEncryption = $password;

            $encryption = $realEncryption;
            $username = $realUsername;
            $password = $realPassword;
        }

        $port = $port > 0 ? $port : 587;
        $enc = strtolower((string) $encryption);
        $isDirectSsl = ($port === 465 || $enc === 'ssl' || $enc === 'smtps');
        $tls = $isDirectSsl ? true : null;

        $transport = new EsmtpTransport($host, $port, $tls);

        if ($isDirectSsl) {
            $transport->setAutoTls(false);
        } elseif (in_array($enc, ['tls', 'starttls']) || $port === 587) {
            $transport->setAutoTls(true);
        } elseif (in_array($enc, ['none', 'null']) || empty($enc)) {
            $transport->setAutoTls(false);
        }

        if (!empty($username)) {
            $transport->setUsername($username);
            $transport->setPassword($password ?? '');
        }

        /** @var \Symfony\Component\Mailer\Transport\Smtp\Stream\SocketStream $stream */
        $stream = $transport->getStream();
        $streamOptions = $stream->getStreamOptions();
        $streamOptions['ssl']['verify_peer'] = false;
        $streamOptions['ssl']['verify_peer_name'] = false;
        $streamOptions['ssl']['allow_self_signed'] = true;
        $stream->setStreamOptions($streamOptions);

        return $transport;
    }

    /**
     * Get or build the general notification mailer (Type 1 Engine)
     */
    public static function getGeneralMailer(): array
    {
        $host = Setting::get('smtp_host') ?: (config('mail.mailers.smtp.host') ?: env('MAIL_HOST', '127.0.0.1'));
        $port = (int) (Setting::get('smtp_port') ?: (config('mail.mailers.smtp.port') ?: env('MAIL_PORT', 587)));
        $encryption = Setting::get('smtp_encryption') ?: (config('mail.mailers.smtp.encryption') ?: env('MAIL_ENCRYPTION', 'tls'));
        $username = Setting::get('smtp_username') ?: (config('mail.mailers.smtp.username') ?: env('MAIL_USERNAME', ''));
        $password = Setting::get('smtp_password') ?: (config('mail.mailers.smtp.password') ?: env('MAIL_PASSWORD', ''));
        $fromAddress = Setting::get('smtp_from_address') ?: (config('mail.from.address') ?: env('MAIL_FROM_ADDRESS', 'noreply@mywatered.com'));
        $fromName = Setting::get('smtp_from_name') ?: (config('mail.from.name') ?: env('MAIL_FROM_NAME', 'Watered'));

        $transport = self::buildTransport($host, $port, $encryption, $username, $password);

        $mailer = new LaravelMailer(
            'general_smtp_' . uniqid(),
            app('view'),
            $transport,
            app('events')
        );

        $mailer->alwaysFrom($fromAddress, $fromName);
        $mailer->alwaysReturnPath($fromAddress);

        return [
            'mailer' => $mailer,
            'from_address' => $fromAddress,
            'from_name' => $fromName,
            'host' => $host,
            'port' => $port,
            'encryption' => $encryption,
        ];
    }

    /**
     * Wrap raw text/markdown in modern Watered branded responsive HTML
     */
    public static function wrapHtml(string $subject, string $bodyContent, string $trackingToken): string
    {
        $siteName = Setting::get('site_name', 'Watered');
        $siteLogo = Setting::get('site_logo_url');
        $emailLogo = Setting::get('email_logo_url');
        $logoSrc = !empty($emailLogo) ? $emailLogo : (!empty($siteLogo) ? $siteLogo : '/logo.png');

        if (!str_starts_with($logoSrc, 'http')) {
            $logoSrc = url($logoSrc);
        }

        $trackingPixelUrl = url("/api/track/email/{$trackingToken}.png");
        $paragraphs = nl2br(e($bodyContent));

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{$subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 36px 16px; color: #0f172a;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);">
        <!-- Top Accent Bar -->
        <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #0f172a 0%, #4338ca 50%, #312e81 100%);"></td>
        </tr>
        <!-- Header -->
        <tr>
            <td style="padding: 32px 36px 24px 36px; text-align: center; border-bottom: 1px solid #f1f5f9;">
                <img src="{$logoSrc}" alt="{$siteName}" style="height: 52px; max-width: 180px; object-contain: contain; margin: 0 auto 12px auto; display: block;" />
                <h2 style="margin: 0; font-size: 16px; font-weight: 700; color: #0f172a; letter-spacing: -0.01em;">{$siteName}</h2>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">Official Member Portal</p>
            </td>
        </tr>
        <!-- Body Content -->
        <tr>
            <td style="padding: 36px; font-size: 14px; line-height: 1.7; color: #334155;">
                {$paragraphs}
            </td>
        </tr>
        <!-- Footer -->
        <tr>
            <td style="padding: 24px 36px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
                <p style="margin: 0 0 8px 0; font-weight: 500; color: #475569;">{$siteName} Membership Register</p>
                <p style="margin: 0 0 8px 0;">
                    <a href="http://mywatered.com/" style="color: #4338ca; text-decoration: none; font-weight: 600;">Visit Watered Website</a> • 
                    <a href="{$trackingPixelUrl}" style="display:none;"></a>
                    <a href="{$logoSrc}" style="color: #4338ca; text-decoration: none; font-weight: 600;">Member Portal</a>
                </p>
                <p style="margin: 0; font-size: 11px; color: #94a3b8;">This is an official administrative transmission. Please do not reply directly to this automated address unless specified.</p>
            </td>
        </tr>
    </table>
    <!-- Tracking Pixel -->
    <img src="{$trackingPixelUrl}" width="1" height="1" alt="" style="display:none !important; border:0; outline:none;" />
</body>
</html>
HTML;
    }

    /**
     * Dispatch general notification email (Type 1 Engine)
     */
    public static function sendGeneralNotification(
        string $recipientEmail,
        string $recipientName,
        string $subject,
        string $rawBody,
        array $metadata = []
    ): ?EmailLog {
        $trackingToken = Str::random(32);
        $html = self::wrapHtml($subject, $rawBody, $trackingToken);

        try {
            $config = self::getGeneralMailer();
            /** @var LaravelMailer $mailer */
            $mailer = $config['mailer'];

            $mailer->html($html, function ($message) use ($recipientEmail, $recipientName, $subject, $config) {
                $message->to($recipientEmail, $recipientName)
                    ->from($config['from_address'], $config['from_name'])
                    ->returnPath($config['from_address'])
                    ->subject($subject);
            });

            return EmailLog::create([
                'recipient_email' => $recipientEmail,
                'recipient_name' => $recipientName,
                'subject' => $subject,
                'status' => 'sent',
                'tracking_token' => $trackingToken,
                'metadata' => array_merge($metadata, [
                    'engine' => 'general_notification',
                    'from' => $config['from_address'],
                    'host' => $config['host'],
                ]),
            ]);
        } catch (\Throwable $e) {
            Log::warning("Failed to dispatch general notification email to {$recipientEmail}: " . $e->getMessage());

            return EmailLog::create([
                'recipient_email' => $recipientEmail,
                'recipient_name' => $recipientName,
                'subject' => $subject,
                'status' => 'failed',
                'tracking_token' => $trackingToken,
                'error_message' => $e->getMessage(),
                'metadata' => array_merge($metadata, [
                    'engine' => 'general_notification',
                ]),
            ]);
        }
    }

    /**
     * Dispatch message email via a specific Sending Account (Type 2 Engine)
     */
    public static function sendMessagingEmail(
        SendingEmailAccount $account,
        string $recipientEmail,
        string $recipientName,
        string $subject,
        string $rawBody,
        array $metadata = []
    ): ?EmailLog {
        $trackingToken = Str::random(32);
        $html = self::wrapHtml($subject, $rawBody, $trackingToken);

        try {
            $mailer = $account->createMailer();

            $mailer->html($html, function ($message) use ($account, $recipientEmail, $recipientName, $subject) {
                $message->to($recipientEmail, $recipientName)
                    ->from($account->from_email, $account->from_name)
                    ->returnPath($account->from_email)
                    ->subject($subject);

                if (!empty($account->reply_to_email)) {
                    $message->replyTo($account->reply_to_email);
                }
            });

            return EmailLog::create([
                'recipient_email' => $recipientEmail,
                'recipient_name' => $recipientName,
                'subject' => $subject,
                'status' => 'sent',
                'tracking_token' => $trackingToken,
                'metadata' => array_merge($metadata, [
                    'engine' => 'messaging_sender',
                    'account_id' => $account->id,
                    'account_name' => $account->name,
                    'from' => $account->from_email,
                ]),
            ]);
        } catch (\Throwable $e) {
            Log::warning("Failed to dispatch messaging email via account [{$account->name}] to {$recipientEmail}: " . $e->getMessage());

            return EmailLog::create([
                'recipient_email' => $recipientEmail,
                'recipient_name' => $recipientName,
                'subject' => $subject,
                'status' => 'failed',
                'tracking_token' => $trackingToken,
                'error_message' => $e->getMessage(),
                'metadata' => array_merge($metadata, [
                    'engine' => 'messaging_sender',
                    'account_id' => $account->id,
                    'account_name' => $account->name,
                ]),
            ]);
        }
    }

    // ==========================================
    // Specific Trigger Event Handlers
    // ==========================================

    /**
     * Trigger 1: User Signup (Application Submitted, Waiting for Approval)
     */
    public static function sendSignupPendingApprovalEmail(MembershipApplication $application): void
    {
        $template = EmailTemplate::where('code', 'application_received')->first();

        $data = [
            'first_name' => $application->first_name,
            'last_name' => $application->last_name,
            'application_number' => $application->application_number,
            'category_name' => $application->category?->name ?? 'Standard',
            'portal_url' => url('/'),
            'parent_website_url' => Setting::get('parent_website_url', 'http://mywatered.com/'),
            'site_name' => Setting::get('site_name', 'Watered'),
        ];

        if ($template && $template->is_active) {
            $rendered = $template->render($data);
            $subject = $rendered['subject'];
            $body = $rendered['body'];
        } else {
            $subject = "Watered Application Received — Reference: {$application->application_number}";
            $body = "Greetings {$application->first_name},\n\nThank you for submitting your application to the Watered register.\n\nYour application has been logged under reference number {$application->application_number} and is currently awaiting review and approval by the administration council.\n\nOnce your credentials have been verified and approved, you will receive an official admission notification with your Member ID and access details.\n\nWatered Secretariat\nhttp://mywatered.com/";
        }

        self::sendGeneralNotification(
            $application->email,
            "{$application->first_name} {$application->last_name}",
            $subject,
            $body,
            [
                'type' => 'signup_pending_approval',
                'application_id' => $application->id,
                'application_number' => $application->application_number,
            ]
        );
    }

    /**
     * Trigger 2: Application Approved & Admitted
     */
    public static function sendApplicationApprovedEmail(
        MembershipApplication $application,
        Member $member,
        User $user,
        string $initialPassword
    ): void {
        $template = EmailTemplate::where('code', 'admission_approved')->first();

        $data = [
            'first_name' => $application->first_name,
            'last_name' => $application->last_name,
            'application_number' => $application->application_number,
            'member_number' => $member->member_number,
            'email' => $user->email,
            'password' => $initialPassword,
            'portal_url' => url('/login'),
            'parent_website_url' => Setting::get('parent_website_url', 'http://mywatered.com/'),
            'site_name' => Setting::get('site_name', 'Watered'),
        ];

        if ($template && $template->is_active) {
            $rendered = $template->render($data);
            $subject = $rendered['subject'];
            $body = $rendered['body'];
        } else {
            $subject = "Official Admission into Watered Register — Member ID: {$member->member_number}";
            $body = "Greetings {$application->first_name},\n\nWe are pleased to inform you that your membership application ({$application->application_number}) has been officially APPROVED by the Administration.\n\nYour official credentials:\n• Member ID: {$member->member_number}\n• Portal Sign-In Email: {$user->email}\n• Initial Password: {$initialPassword}\n\nYour digital membership card and verified member portal access are now active. Sign in directly to view your digital pass:\n" . url('/login') . "\n\nWelcome to Watered.";
        }

        self::sendGeneralNotification(
            $application->email,
            "{$application->first_name} {$application->last_name}",
            $subject,
            $body,
            [
                'type' => 'application_approved',
                'application_id' => $application->id,
                'member_id' => $member->id,
                'member_number' => $member->member_number,
            ]
        );
    }

    /**
     * Trigger 2b: Additional Contact / Info Requested for Application
     */
    public static function sendApplicationContactRequiredEmail(MembershipApplication $application, string $notes): void
    {
        if (empty($application->email)) {
            return;
        }

        $template = EmailTemplate::where('code', 'application_contact_required')->first();
        $siteName = Setting::get('site_name', 'Watered');
        $parentUrl = Setting::get('parent_website_url', 'http://mywatered.com/');

        $data = [
            'first_name' => $application->first_name,
            'last_name' => $application->last_name,
            'application_number' => $application->application_number,
            'notes' => $notes,
            'site_name' => $siteName,
            'parent_website_url' => $parentUrl,
        ];

        if ($template && $template->is_active) {
            $rendered = $template->render($data);
            $subject = $rendered['subject'];
            $body = $rendered['body'];
        } else {
            $subject = "Action Required: Contact Details / Information Requested for Application #{$application->application_number}";
            $body = "Greetings {$application->first_name},\n\nThe membership committee has reviewed your pending membership application (#{$application->application_number}) and requires additional contact details or information to proceed with your enrollment.\n\nAdministrator Request:\n{$notes}\n\nPlease reply directly to this email or reach out to administration with the requested details so your application can be finalized.\n\nWatered Membership Administration\n{$parentUrl}";
        }

        self::sendGeneralNotification(
            $application->email,
            "{$application->first_name} {$application->last_name}",
            $subject,
            $body,
            [
                'type' => 'application_contact_required',
                'application_id' => $application->id,
                'application_number' => $application->application_number,
            ]
        );
    }

    /**
     * Trigger 2c: Membership Application Rejected
     */
    public static function sendApplicationRejectedEmail(MembershipApplication $application, string $reason): void
    {
        if (empty($application->email)) {
            return;
        }

        $template = EmailTemplate::where('code', 'application_rejected')->first();
        $siteName = Setting::get('site_name', 'Watered');
        $parentUrl = Setting::get('parent_website_url', 'http://mywatered.com/');

        $reasonSection = !empty($reason) ? "Reason / Notes Provided:\n{$reason}\n\n" : "";

        $data = [
            'first_name' => $application->first_name,
            'last_name' => $application->last_name,
            'application_number' => $application->application_number,
            'reason_section' => $reasonSection,
            'site_name' => $siteName,
            'parent_website_url' => $parentUrl,
        ];

        if ($template && $template->is_active) {
            $rendered = $template->render($data);
            $subject = $rendered['subject'];
            $body = $rendered['body'];
        } else {
            $subject = "Update Regarding Your Membership Application #{$application->application_number}";
            $body = "Greetings {$application->first_name},\n\nThank you for your interest in joining the {$siteName} register (#{$application->application_number}).\n\nFollowing a review by the admissions board, we regret to inform you that your application could not be approved at this time.\n\n{$reasonSection}If you have questions or believe this is an error, please contact administration.\n\n{$siteName} Membership Admissions\n{$parentUrl}";
        }

        self::sendGeneralNotification(
            $application->email,
            "{$application->first_name} {$application->last_name}",
            $subject,
            $body,
            [
                'type' => 'application_rejected',
                'application_id' => $application->id,
                'application_number' => $application->application_number,
            ]
        );
    }

    /**
     * Trigger 3: User Login Security Alert
     */
    public static function sendLoginAlertEmail(User $user, Request $request): void
    {
        // Don't send login alert if user has no valid email
        if (empty($user->email)) {
            return;
        }

        $template = EmailTemplate::where('code', 'member_login_alert')->first();
        $ip = $request->ip() ?: 'Unknown IP';
        $userAgent = (string) $request->userAgent();
        $timestamp = now()->toDayDateTimeString() . ' (' . config('app.timezone', 'UTC') . ')';

        $data = [
            'name' => $user->name,
            'email' => $user->email,
            'timestamp' => $timestamp,
            'ip_address' => $ip,
            'user_agent' => substr($userAgent, 0, 150),
            'portal_url' => url('/'),
            'site_name' => Setting::get('site_name', 'Watered'),
        ];

        if ($template && $template->is_active) {
            $rendered = $template->render($data);
            $subject = $rendered['subject'];
            $body = $rendered['body'];
        } else {
            $subject = "Watered Portal — Security Notice: Sign-in Alert";
            $body = "Greetings {$user->name},\n\nThis is a security notification to confirm that your Watered Portal account was accessed.\n\nSign-in details:\n• Date & Time: {$timestamp}\n• IP Address: {$ip}\n• Device/Client: " . substr($userAgent, 0, 100) . "\n\nIf this was you, no action is required.\nIf you did not authorize this session, please contact Administration immediately to secure your credentials.\n\nWatered Security Team";
        }

        self::sendGeneralNotification(
            $user->email,
            $user->name,
            $subject,
            $body,
            [
                'type' => 'login_security_alert',
                'user_id' => $user->id,
                'ip' => $ip,
            ]
        );
    }

    /**
     * Trigger 4: Membership Tier / Category Upgraded
     */
    public static function sendMemberUpgradedEmail(
        Member $member,
        MembershipCategory $newCategory,
        ?string $reason = null
    ): void {
        $user = $member->user;
        $profile = $member->profile;
        $recipientEmail = $user?->email;
        if (empty($recipientEmail)) {
            return;
        }

        $recipientName = $profile ? $profile->full_name : ($user->name ?? 'Member');
        $template = EmailTemplate::where('code', 'membership_upgraded')->first();

        $reasonText = !empty($reason) ? "\nUpdate Details: {$reason}\n" : '';

        $data = [
            'first_name' => $profile?->first_name ?: $recipientName,
            'member_number' => $member->member_number,
            'category_name' => $newCategory->name,
            'reason_section' => $reasonText,
            'portal_url' => url('/'),
            'site_name' => Setting::get('site_name', 'Watered'),
        ];

        if ($template && $template->is_active) {
            $rendered = $template->render($data);
            $subject = $rendered['subject'];
            $body = $rendered['body'];
        } else {
            $subject = "Watered Notice: Membership Upgraded to {$newCategory->name} Tier";
            $body = "Greetings {$recipientName},\n\nWe are pleased to inform you that your Watered membership has been upgraded to {$newCategory->name} standing.\n\nYour official Member ID: {$member->member_number}\n{$reasonText}\nYour updated privileges and digital credentials have been refreshed across the register. View your updated pass at:\n" . url('/dashboard') . "\n\nWatered Council";
        }

        self::sendGeneralNotification(
            $recipientEmail,
            $recipientName,
            $subject,
            $body,
            [
                'type' => 'membership_upgraded',
                'member_id' => $member->id,
                'category_id' => $newCategory->id,
            ]
        );
    }

    /**
     * Trigger 5: Broadcast or Direct Message Received
     */
    public static function sendMessageNotification(
        Member $member,
        Message $message,
        ?SendingEmailAccount $account = null
    ): void {
        $user = $member->user;
        $profile = $member->profile;
        $recipientEmail = $user?->email;
        if (empty($recipientEmail)) {
            return;
        }

        $recipientName = $profile ? $profile->full_name : ($user->name ?? 'Member');
        $subject = "Watered Notice: {$message->subject}";
        $body = "Greetings {$recipientName},\n\nAn official communication has been dispatched to your Watered inbox:\n\n----------------------------------------\n{$message->body}\n----------------------------------------\n\nYou can review this message and past bulletins anytime in the Watered Portal:\n" . url('/messages') . "\n\nWatered Member Network";

        if ($account) {
            self::sendMessagingEmail($account, $recipientEmail, $recipientName, $subject, $body, [
                'type' => 'broadcast_message',
                'message_id' => $message->id,
                'member_id' => $member->id,
            ]);
        } else {
            self::sendGeneralNotification($recipientEmail, $recipientName, $subject, $body, [
                'type' => 'broadcast_message',
                'message_id' => $message->id,
                'member_id' => $member->id,
            ]);
        }
    }
}
