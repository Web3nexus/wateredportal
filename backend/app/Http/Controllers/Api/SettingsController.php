<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\EmailLog;
use App\Models\Setting;
use App\Models\SmsLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\Mailer\Transport\Dsn;
use Symfony\Component\Mailer\Transport\Smtp\EsmtpTransportFactory;

class SettingsController extends Controller
{
    /**
     * Get public branding settings for headers, footers, favicons
     */
    public function getPublicSettings(): JsonResponse
    {
        return response()->json([
            'site_name' => Setting::get('site_name', 'Watered'),
            'parent_website_url' => Setting::get('parent_website_url', 'http://mywatered.com/'),
            'site_logo_url' => Setting::get('site_logo_url', ''),
            'favicon_url' => Setting::get('favicon_url', ''),
            'email_logo_url' => Setting::get('email_logo_url', ''),
            'primary_color' => Setting::get('primary_color', '#966922'),
        ]);
    }

    /**
     * Get all administrative settings (passwords masked)
     */
    public function getSettings(): JsonResponse
    {
        $settings = Setting::all();

        $data = [
            'branding' => [
                'site_name' => 'Watered',
                'parent_website_url' => 'http://mywatered.com/',
                'site_logo_url' => '',
                'favicon_url' => '',
                'email_logo_url' => '',
                'primary_color' => '#966922',
            ],
            'smtp' => [
                'smtp_host' => env('MAIL_HOST', config('mail.mailers.smtp.host', '127.0.0.1')),
                'smtp_port' => (int) env('MAIL_PORT', config('mail.mailers.smtp.port', 587)),
                'smtp_username' => env('MAIL_USERNAME', config('mail.mailers.smtp.username', '')),
                'smtp_password' => !empty(env('MAIL_PASSWORD')) ? '••••••••' : '',
                'smtp_encryption' => env('MAIL_ENCRYPTION', config('mail.mailers.smtp.encryption', 'tls')),
                'smtp_from_address' => env('MAIL_FROM_ADDRESS', config('mail.from.address', 'noreply@mywatered.com')),
                'smtp_from_name' => env('MAIL_FROM_NAME', config('mail.from.name', 'Watered')),
            ],
            'sms' => [
                'sms_enabled' => '0',
                'sms_provider' => 'twilio',
                'twilio_account_sid' => '',
                'twilio_auth_token' => '',
                'twilio_from_number' => '',
            ],
        ];

        foreach ($settings as $setting) {
            $group = $setting->group ?? 'general';
            if (!isset($data[$group])) {
                $data[$group] = [];
            }

            if ($setting->is_secret && !empty($setting->value)) {
                $data[$group][$setting->key] = '••••••••';
            } elseif (!empty($setting->value)) {
                $data[$group][$setting->key] = $setting->value;
            }
        }

        return response()->json([
            'settings' => $data,
        ]);
    }

    /**
     * Update settings
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'branding' => ['nullable', 'array'],
            'smtp' => ['nullable', 'array'],
            'sms' => ['nullable', 'array'],
        ]);

        $admin = $request->user();

        // 1. Branding Settings
        if (isset($validated['branding'])) {
            foreach ($validated['branding'] as $key => $value) {
                Setting::set($key, (string) $value, 'branding', false);
            }
        }

        // 2. SMTP Settings
        if (isset($validated['smtp'])) {
            foreach ($validated['smtp'] as $key => $value) {
                $isSecret = ($key === 'smtp_password');
                if ($isSecret && ($value === '••••••••' || $value === null || $value === '')) {
                    // Do not overwrite existing secret with masked placeholder
                    continue;
                }
                Setting::set($key, (string) $value, 'smtp', $isSecret);
            }
        }

        // 3. SMS Settings
        if (isset($validated['sms'])) {
            foreach ($validated['sms'] as $key => $value) {
                $isSecret = ($key === 'twilio_auth_token');
                if ($isSecret && ($value === '••••••••' || $value === null || $value === '')) {
                    continue;
                }
                Setting::set($key, (string) $value, 'sms', $isSecret);
            }
        }

        AuditLog::record('settings_updated', null, [
            'sections' => array_keys($validated),
        ], $admin);

        return response()->json([
            'message' => 'System settings updated successfully.',
        ]);
    }

    /**
     * Upload branding asset (site logo, favicon, email logo)
     */
    public function uploadAsset(Request $request): JsonResponse
    {
        $request->validate([
            'asset_type' => ['required', 'string', 'in:site_logo,favicon,email_logo'],
            'file' => ['required', 'file', 'mimes:png,jpg,jpeg,svg,ico,webp', 'max:4096'],
        ]);

        $assetType = $request->input('asset_type');
        $file = $request->file('file');
        
        $extension = $file->getClientOriginalExtension();
        $fileName = $assetType . '_' . time() . '.' . $extension;
        $path = $file->storeAs('branding', $fileName, 'public');

        $url = '/storage/' . $path;

        // Persist to setting
        $settingKey = $assetType . '_url';
        Setting::set($settingKey, $url, 'branding', false);

        return response()->json([
            'message' => 'Asset uploaded successfully.',
            'asset_type' => $assetType,
            'url' => $url,
        ]);
    }

    /**
     * Test SMTP configuration
     */
    public function testSmtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'recipient_email' => ['required', 'email'],
            'smtp_host' => ['nullable', 'string'],
            'smtp_port' => ['nullable', 'numeric'],
            'smtp_username' => ['nullable', 'string'],
            'smtp_password' => ['nullable', 'string'],
            'smtp_encryption' => ['nullable', 'string'],
            'smtp_from_address' => ['nullable', 'string'],
            'smtp_from_name' => ['nullable', 'string'],
        ]);

        $recipientEmail = $validated['recipient_email'];

        // Determine SMTP credentials with robust fallback: request -> Setting -> env -> config
        $host = !empty($validated['smtp_host']) ? $validated['smtp_host'] : Setting::get('smtp_host', env('MAIL_HOST', config('mail.mailers.smtp.host', '127.0.0.1')));
        $port = !empty($validated['smtp_port']) ? (int) $validated['smtp_port'] : (int) Setting::get('smtp_port', env('MAIL_PORT', config('mail.mailers.smtp.port', 587)));
        $username = !empty($validated['smtp_username']) ? $validated['smtp_username'] : Setting::get('smtp_username', env('MAIL_USERNAME', config('mail.mailers.smtp.username', '')));
        
        $password = $validated['smtp_password'] ?? null;
        if (empty($password) || $password === '••••••••') {
            $password = Setting::get('smtp_password', env('MAIL_PASSWORD', config('mail.mailers.smtp.password', '')));
        }

        $encryption = !empty($validated['smtp_encryption']) ? $validated['smtp_encryption'] : Setting::get('smtp_encryption', env('MAIL_ENCRYPTION', config('mail.mailers.smtp.encryption', 'tls')));
        $fromAddress = !empty($validated['smtp_from_address']) ? $validated['smtp_from_address'] : Setting::get('smtp_from_address', env('MAIL_FROM_ADDRESS', config('mail.from.address', 'noreply@mywatered.com')));
        $fromName = !empty($validated['smtp_from_name']) ? $validated['smtp_from_name'] : Setting::get('smtp_from_name', env('MAIL_FROM_NAME', Setting::get('site_name', 'Watered')));

        // Generate tracking token
        $trackingToken = Str::random(32);
        $baseUrl = url('/');
        $trackingPixelUrl = "{$baseUrl}/api/track/email/{$trackingToken}.png";

        $emailLogo = Setting::get('email_logo_url');
        $siteLogo = Setting::get('site_logo_url');
        $logoSrc = !empty($emailLogo) ? $emailLogo : (!empty($siteLogo) ? $siteLogo : '');
        if ($logoSrc && !str_starts_with($logoSrc, 'http')) {
            $logoSrc = url($logoSrc);
        }

        $subject = 'Watered Portal — SMTP Gateway Diagnostic Test';
        $timestamp = now()->toDateTimeString();

        $htmlBody = <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{$subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #faf9f5; margin: 0; padding: 40px 20px;">
    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2ddd3; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="background-color: #1a1918; padding: 24px 32px; text-align: center;">
            {$this->renderLogoHtml($logoSrc)}
            <h1 style="color: #ffffff; font-size: 18px; margin: 12px 0 0; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase;">Watered Portal</h1>
        </div>
        <div style="padding: 32px; color: #2c2926; font-size: 14px; line-height: 1.6;">
            <p style="margin-top: 0; font-weight: 600; color: #16a34a; font-size: 16px;">✓ SMTP Connection Established Successfully</p>
            <p>This is an automated transmission confirming that your outbound mail relay configuration is functional.</p>
            <div style="background-color: #f7f6f2; border-left: 3px solid #966922; padding: 12px 16px; margin: 20px 0; font-family: monospace; font-size: 12px; color: #444;">
                <div>Host: {$host}:{$port}</div>
                <div>Encryption: {$encryption}</div>
                <div>Sender: {$fromName} &lt;{$fromAddress}&gt;</div>
                <div>Dispatched: {$timestamp}</div>
            </div>
            <p style="color: #666; font-size: 13px;">Open-tracking has been integrated into this message. When this email is rendered in your client, open statistics will update live in your Watered communications dashboard.</p>
        </div>
        <div style="background-color: #f3f1eb; padding: 16px 32px; text-align: center; font-size: 11px; color: #78716c; border-top: 1px solid #e7e4dc;">
            © Watered Portal • <a href="http://mywatered.com/" style="color: #966922; text-decoration: none;">http://mywatered.com/</a>
        </div>
    </div>
    <img src="{$trackingPixelUrl}" width="1" height="1" alt="" style="display:none !important;" />
</body>
</html>
HTML;

        try {
            $transport = \App\Services\EmailService::buildTransport(
                host: $host,
                port: $port,
                encryption: $encryption,
                username: $username,
                password: $password
            );

            $mailer = new \Illuminate\Mail\Mailer(
                'smtp_test_' . uniqid(),
                app('view'),
                $transport,
                app('events')
            );
            $mailer->alwaysFrom($fromAddress, $fromName);

            // Attempt to send directly via live socket transport
            $mailer->html($htmlBody, function ($message) use ($recipientEmail, $fromAddress, $fromName, $subject) {
                $message->to($recipientEmail)
                    ->from($fromAddress, $fromName)
                    ->returnPath($fromAddress)
                    ->subject($subject);
            });

            // Log successful email dispatch
            $emailLog = EmailLog::create([
                'recipient_email' => $recipientEmail,
                'recipient_name' => 'Administrator',
                'subject' => $subject,
                'status' => 'sent',
                'tracking_token' => $trackingToken,
                'metadata' => [
                    'host' => $host,
                    'port' => $port,
                    'encryption' => $encryption,
                    'type' => 'test_email',
                ],
            ]);

            return response()->json([
                'success' => true,
                'message' => "Test email successfully delivered to {$recipientEmail} via {$host}:{$port}.",
                'log_id' => $emailLog->id,
            ]);
        } catch (\Throwable $e) {
            EmailLog::create([
                'recipient_email' => $recipientEmail,
                'recipient_name' => 'Administrator',
                'subject' => $subject,
                'status' => 'failed',
                'tracking_token' => $trackingToken,
                'error_message' => $e->getMessage(),
                'metadata' => [
                    'host' => $host,
                    'port' => $port,
                    'encryption' => $encryption,
                    'type' => 'test_email',
                ],
            ]);

            $errorMsg = $e->getMessage();
            if (str_contains($errorMsg, '535') || str_contains($errorMsg, 'Incorrect authentication data')) {
                $errorMsg .= " — Server rejected credentials for '{$username}'. Check: 1) Verify this exact email account exists in your mail server / cPanel; 2) If the password contains special characters (#, $, \", !), ensure it is enclosed in double quotes in .env (e.g. MAIL_PASSWORD=\"...\"); 3) Re-type the password in the Settings form and click 'Save Changes' to update any stored database value.";
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to send test email: ' . $errorMsg,
            ], 422);
        }
    }

    /**
     * Test SMS Gateway (Twilio)
     */
    public function testSms(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'recipient_phone' => ['required', 'string'],
            'twilio_account_sid' => ['nullable', 'string'],
            'twilio_auth_token' => ['nullable', 'string'],
            'twilio_from_number' => ['nullable', 'string'],
        ]);

        $recipientPhone = $validated['recipient_phone'];
        $sid = $validated['twilio_account_sid'] ?? Setting::get('twilio_account_sid');
        
        $token = $validated['twilio_auth_token'] ?? null;
        if (empty($token) || $token === '••••••••') {
            $token = Setting::get('twilio_auth_token');
        }

        $fromNumber = $validated['twilio_from_number'] ?? Setting::get('twilio_from_number');
        $siteName = Setting::get('site_name', 'Watered');

        $messageBody = "{$siteName} Portal: SMS Gateway Diagnostic test successful at " . now()->format('H:i:s T') . ". System operational.";

        if (empty($sid) || empty($token) || empty($fromNumber)) {
            // Record simulated / mock attempt if credentials are not configured yet
            $smsLog = SmsLog::create([
                'recipient_phone' => $recipientPhone,
                'recipient_name' => 'Admin Diagnostic',
                'message_body' => $messageBody,
                'status' => 'sent',
                'gateway' => 'twilio_simulation',
                'external_id' => 'SIM-' . Str::upper(Str::random(12)),
            ]);

            return response()->json([
                'success' => true,
                'simulated' => true,
                'message' => 'Twilio credentials not fully configured; recorded simulated dispatch in SMS log.',
                'log_id' => $smsLog->id,
            ]);
        }

        try {
            // Live Twilio REST API request
            $twilioUrl = "https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json";

            $response = Http::withBasicAuth($sid, $token)
                ->asForm()
                ->post($twilioUrl, [
                    'From' => $fromNumber,
                    'To' => $recipientPhone,
                    'Body' => $messageBody,
                ]);

            if ($response->successful()) {
                $responseData = $response->json();
                $externalId = $responseData['sid'] ?? null;

                $smsLog = SmsLog::create([
                    'recipient_phone' => $recipientPhone,
                    'recipient_name' => 'Admin Diagnostic',
                    'message_body' => $messageBody,
                    'status' => 'sent',
                    'gateway' => 'twilio',
                    'external_id' => $externalId,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => "Test SMS dispatched to {$recipientPhone} via Twilio.",
                    'log_id' => $smsLog->id,
                ]);
            } else {
                $err = $response->json()['message'] ?? $response->body();
                SmsLog::create([
                    'recipient_phone' => $recipientPhone,
                    'recipient_name' => 'Admin Diagnostic',
                    'message_body' => $messageBody,
                    'status' => 'failed',
                    'gateway' => 'twilio',
                    'error_message' => $err,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => "Twilio error: {$err}",
                ], 422);
            }
        } catch (\Throwable $e) {
            SmsLog::create([
                'recipient_phone' => $recipientPhone,
                'recipient_name' => 'Admin Diagnostic',
                'message_body' => $messageBody,
                'status' => 'failed',
                'gateway' => 'twilio',
                'error_message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to dispatch SMS: ' . $e->getMessage(),
            ], 422);
        }
    }

    private function renderLogoHtml(?string $logoUrl): string
    {
        if (!empty($logoUrl)) {
            return "<img src=\"{$logoUrl}\" alt=\"Watered\" style=\"max-height: 48px; max-width: 180px; margin: 0 auto; display: block;\" />";
        }

        return '<div style="display: inline-block; width: 42px; height: 42px; line-height: 42px; border-radius: 4px; background: #966922; color: #ffffff; font-family: serif; font-size: 24px; font-weight: bold; text-align: center;">W</div>';
    }
}
