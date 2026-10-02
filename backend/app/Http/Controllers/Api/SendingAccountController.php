<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\EmailLog;
use App\Models\SendingEmailAccount;
use App\Services\EmailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SendingAccountController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SendingEmailAccount::query();

        if ($request->boolean('active_only')) {
            $query->active();
        }

        $accounts = $query->orderBy('is_default', 'desc')
            ->orderBy('id', 'asc')
            ->get();

        $masked = $accounts->map(function ($account) {
            $data = $account->toArray();
            $data['smtp_password'] = !empty($account->smtp_password) ? '••••••••' : '';
            return $data;
        });

        return response()->json([
            'accounts' => $masked,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'from_name' => ['required', 'string', 'max:150'],
            'from_email' => ['required', 'email', 'max:255'],
            'reply_to_email' => ['nullable', 'email', 'max:255'],
            'smtp_host' => ['required', 'string', 'max:255'],
            'smtp_port' => ['required', 'integer', 'between:1,65535'],
            'smtp_username' => ['nullable', 'string', 'max:255'],
            'smtp_password' => ['nullable', 'string', 'max:255'],
            'smtp_encryption' => ['nullable', 'string', 'in:tls,ssl,none'],
            'is_default' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        if (!empty($validated['is_default'])) {
            SendingEmailAccount::where('is_default', true)->update(['is_default' => false]);
        }

        // If this is the first account, make it default
        if (SendingEmailAccount::count() === 0) {
            $validated['is_default'] = true;
        }

        $account = SendingEmailAccount::create($validated);

        AuditLog::record('sending_account_created', $account, [
            'name' => $account->name,
            'from_email' => $account->from_email,
        ], $request->user());

        $data = $account->toArray();
        $data['smtp_password'] = !empty($account->smtp_password) ? '••••••••' : '';

        return response()->json([
            'message' => "Sending mail account [{$account->name}] created successfully.",
            'account' => $data,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $account = SendingEmailAccount::findOrFail($id);
        $data = $account->toArray();
        $data['smtp_password'] = !empty($account->smtp_password) ? '••••••••' : '';

        return response()->json([
            'account' => $data,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $account = SendingEmailAccount::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'from_name' => ['sometimes', 'required', 'string', 'max:150'],
            'from_email' => ['sometimes', 'required', 'email', 'max:255'],
            'reply_to_email' => ['nullable', 'email', 'max:255'],
            'smtp_host' => ['sometimes', 'required', 'string', 'max:255'],
            'smtp_port' => ['sometimes', 'required', 'integer', 'between:1,65535'],
            'smtp_username' => ['nullable', 'string', 'max:255'],
            'smtp_password' => ['nullable', 'string', 'max:255'],
            'smtp_encryption' => ['nullable', 'string', 'in:tls,ssl,none'],
            'is_default' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        if (isset($validated['is_default']) && $validated['is_default']) {
            SendingEmailAccount::where('id', '!=', $account->id)->update(['is_default' => false]);
        }

        // Don't overwrite password if masked
        if (isset($validated['smtp_password']) && ($validated['smtp_password'] === '••••••••' || empty($validated['smtp_password']))) {
            unset($validated['smtp_password']);
        }

        $account->update($validated);

        AuditLog::record('sending_account_updated', $account, [
            'name' => $account->name,
            'from_email' => $account->from_email,
        ], $request->user());

        $data = $account->toArray();
        $data['smtp_password'] = !empty($account->smtp_password) ? '••••••••' : '';

        return response()->json([
            'message' => "Sending mail account [{$account->name}] updated successfully.",
            'account' => $data,
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $account = SendingEmailAccount::findOrFail($id);
        $wasDefault = $account->is_default;
        $name = $account->name;

        $account->delete();

        if ($wasDefault) {
            $next = SendingEmailAccount::first();
            if ($next) {
                $next->update(['is_default' => true]);
            }
        }

        AuditLog::record('sending_account_deleted', null, [
            'name' => $name,
        ], $request->user());

        return response()->json([
            'message' => "Sending mail account [{$name}] removed.",
        ]);
    }

    public function setDefault(Request $request, int $id): JsonResponse
    {
        $account = SendingEmailAccount::findOrFail($id);

        SendingEmailAccount::where('is_default', true)->update(['is_default' => false]);
        $account->update(['is_default' => true]);

        AuditLog::record('sending_account_set_default', $account, [
            'name' => $account->name,
        ], $request->user());

        return response()->json([
            'message' => "[{$account->name}] is now the default sending account for member communications.",
            'account' => $account,
        ]);
    }

    public function test(Request $request, int $id): JsonResponse
    {
        $account = SendingEmailAccount::findOrFail($id);

        $validated = $request->validate([
            'recipient_email' => ['required', 'email'],
        ]);

        $recipientEmail = $validated['recipient_email'];
        $subject = "Watered Diagnostic: Test Email from {$account->name}";
        $timestamp = now()->toDayDateTimeString();
        $body = "Greetings,\n\nThis is a verification test dispatch from the Watered Portal messaging engine.\n\nAccount Configuration:\n• Sender Profile: {$account->name}\n• From Address: {$account->from_name} <{$account->from_email}>\n• SMTP Gateway: {$account->smtp_host}:{$account->smtp_port}\n• Encryption: {$account->smtp_encryption}\n• Dispatched At: {$timestamp}\n\nYour outbound email engine is operational and ready to send member communications.\n\nWatered System Diagnostics";

        $log = EmailService::sendMessagingEmail(
            $account,
            $recipientEmail,
            'Administrator',
            $subject,
            $body,
            [
                'type' => 'sending_account_test',
                'account_id' => $account->id,
            ]
        );

        if ($log && $log->status === 'sent') {
            return response()->json([
                'success' => true,
                'message' => "Test email successfully dispatched to {$recipientEmail} via [{$account->name}].",
                'log_id' => $log->id,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => "Failed to deliver test message: " . ($log?->error_message ?? 'Connection or authentication failure.'),
            'error' => $log?->error_message,
        ], 422);
    }
}
