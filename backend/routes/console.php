<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('mail:test {recipient? : The email address to send a test message to} {--reset-db : Clear database SMTP overrides and force .env credentials}', function ($recipient = null) {
    if ($this->option('reset-db')) {
        \App\Models\Setting::whereIn('key', [
            'smtp_host',
            'smtp_port',
            'smtp_username',
            'smtp_password',
            'smtp_encryption',
            'smtp_from_address',
            'smtp_from_name',
        ])->delete();
        $this->info('✓ Cleared database SMTP overrides. Application will now strictly use .env credentials.');
    }

    $dbHost = \App\Models\Setting::where('key', 'smtp_host')->value('value');
    $dbUser = \App\Models\Setting::where('key', 'smtp_username')->value('value');
    $hasDbPass = \App\Models\Setting::where('key', 'smtp_password')->exists();

    $host = \App\Models\Setting::get('smtp_host', env('MAIL_HOST', config('mail.mailers.smtp.host', '127.0.0.1')));
    $port = (int) \App\Models\Setting::get('smtp_port', env('MAIL_PORT', config('mail.mailers.smtp.port', 587)));
    $username = \App\Models\Setting::get('smtp_username', env('MAIL_USERNAME', config('mail.mailers.smtp.username', '')));
    $password = \App\Models\Setting::get('smtp_password', env('MAIL_PASSWORD', config('mail.mailers.smtp.password', '')));
    $encryption = \App\Models\Setting::get('smtp_encryption', env('MAIL_ENCRYPTION', config('mail.mailers.smtp.encryption', 'tls')));
    $fromAddress = \App\Models\Setting::get('smtp_from_address', env('MAIL_FROM_ADDRESS', config('mail.from.address', 'noreply@mywatered.com')));
    $fromName = \App\Models\Setting::get('smtp_from_name', env('MAIL_FROM_NAME', 'Watered'));

    $this->info('--- Current Mail Configuration ---');
    $this->line("Host:       {$host} " . ($dbHost ? '[DB override]' : '[from .env]'));
    $this->line("Port:       {$port}");
    $this->line("Encryption: {$encryption}");
    $this->line("Username:   {$username} " . ($dbUser ? '[DB override]' : '[from .env]'));
    $this->line("Password:   " . (empty($password) ? '<EMPTY>' : str_repeat('*', min(strlen($password), 8)) . ' (length ' . strlen($password) . ')') . ($hasDbPass ? ' [DB override]' : ' [from .env]'));
    $this->line("From:       {$fromName} <{$fromAddress}>");
    $this->info('----------------------------------');

    if (empty($recipient)) {
        $recipient = $this->ask('Enter destination email address for the test', $fromAddress);
    }

    $this->comment("Attempting SMTP handshake & dispatch to {$recipient}...");

    try {
        $transport = \App\Services\EmailService::buildTransport($host, $port, $username, $password, $encryption);
        $mailer = new \Illuminate\Mail\Mailer('live_test', app('view'), $transport, app('events'));

        $mailer->html("<p>This is a successful SMTP test from Watered Portal (" . now()->toIso8601String() . ").</p>", function ($msg) use ($recipient, $fromAddress, $fromName) {
            $msg->to($recipient)
                ->from($fromAddress, $fromName)
                ->subject('Watered Portal — Live SMTP Test');
        });

        $this->info("✓ SUCCESS! Test email was successfully accepted by {$host} for {$recipient}.");
        return 0;
    } catch (\Throwable $e) {
        $this->error("✗ FAILED: " . $e->getMessage());

        if (str_contains($e->getMessage(), '535') || str_contains($e->getMessage(), 'authentication data')) {
            $this->warn("\nTroubleshooting '535 Incorrect authentication data':");
            $this->line("1. Verify the mailbox username '{$username}' actually exists on this mail server.");
            $this->line("   - In cPanel, check 'Email Accounts'. Is it '{$username}' or is it under the primary domain (e.g. user@hudorian.com)?");
            $this->line("2. Check the password in .env:");
            $this->line("   - If the password contains special characters (like #, $, \", !), wrap it in double quotes:");
            $this->line('     MAIL_PASSWORD="your#password"');
            $this->line("   - Without quotes, characters like '#' make Laravel treat the rest of the password as a comment!");
            $this->line("3. Database Override:");
            $this->line("   - If an old password was saved in the database settings table, run with --reset-db to clear it:");
            $this->line("     php artisan mail:test {$recipient} --reset-db");
        }

        return 1;
    }
})->purpose('Test live SMTP connection and dispatch a diagnostic email');

