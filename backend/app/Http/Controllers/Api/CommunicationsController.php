<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailLog;
use App\Models\MembershipApplication;
use App\Models\SmsLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CommunicationsController extends Controller
{
    /**
     * Aggregated statistics for email tracking, SMS tracking, and registrations
     */
    public function stats(): JsonResponse
    {
        $totalEmails = EmailLog::count();
        $openedEmails = EmailLog::where('status', 'opened')->orWhere('opens_count', '>', 0)->count();
        $unopenedEmails = max(0, $totalEmails - $openedEmails);
        $openRate = $totalEmails > 0 ? round(($openedEmails / $totalEmails) * 100, 1) : 0;

        $totalSms = SmsLog::count();
        $deliveredSms = SmsLog::whereIn('status', ['delivered', 'sent'])->count();
        $failedSms = SmsLog::where('status', 'failed')->count();

        $totalApplications = MembershipApplication::count();
        $approvedApplications = MembershipApplication::where('status', 'approved')->count();
        $pendingApplications = MembershipApplication::whereIn('status', ['pending', 'under_review'])->count();
        $rejectedApplications = MembershipApplication::where('status', 'rejected')->count();

        $recentEmailActivity = EmailLog::latest()->take(5)->get();
        $recentSmsActivity = SmsLog::latest()->take(5)->get();

        return response()->json([
            'email' => [
                'total_sent' => $totalEmails,
                'opened' => $openedEmails,
                'unopened' => $unopenedEmails,
                'open_rate' => $openRate,
                'recent' => $recentEmailActivity,
            ],
            'sms' => [
                'total_sent' => $totalSms,
                'delivered' => $deliveredSms,
                'failed' => $failedSms,
                'recent' => $recentSmsActivity,
            ],
            'registrations' => [
                'total' => $totalApplications,
                'pending' => $pendingApplications,
                'approved' => $approvedApplications,
                'rejected' => $rejectedApplications,
                'conversion_rate' => $totalApplications > 0 ? round(($approvedApplications / $totalApplications) * 100, 1) : 0,
            ],
        ]);
    }

    /**
     * Paginated list of tracked emails with filtering
     */
    public function emailLogs(Request $request): JsonResponse
    {
        $query = EmailLog::latest();

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $status = $request->input('status');
            if ($status === 'opened') {
                $query->where(function ($q) {
                    $q->where('status', 'opened')->orWhere('opens_count', '>', 0);
                });
            } elseif ($status === 'unopened') {
                $query->where(function ($q) {
                    $q->where('status', 'sent')->where('opens_count', 0);
                });
            } else {
                $query->where('status', $status);
            }
        }

        if ($request->filled('q')) {
            $search = '%' . $request->input('q') . '%';
            $query->where(function ($q) use ($search) {
                $q->where('recipient_email', 'like', $search)
                  ->orWhere('recipient_name', 'like', $search)
                  ->orWhere('subject', 'like', $search);
            });
        }

        $perPage = min(50, (int) $request->input('per_page', 15));
        $logs = $query->paginate($perPage);

        return response()->json($logs);
    }

    /**
     * Paginated list of SMS dispatches with filtering
     */
    public function smsLogs(Request $request): JsonResponse
    {
        $query = SmsLog::latest();

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('q')) {
            $search = '%' . $request->input('q') . '%';
            $query->where(function ($q) use ($search) {
                $q->where('recipient_phone', 'like', $search)
                  ->orWhere('recipient_name', 'like', $search)
                  ->orWhere('message_body', 'like', $search);
            });
        }

        $perPage = min(50, (int) $request->input('per_page', 15));
        $logs = $query->paginate($perPage);

        return response()->json($logs);
    }

    /**
     * Transparent 1x1 tracking pixel to track email opens
     */
    public function trackEmail(string $token): Response
    {
        $log = EmailLog::where('tracking_token', $token)->first();

        if ($log) {
            $log->markAsOpened();
        }

        // 1x1 transparent PNG binary bytes
        $pixel = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');

        return response($pixel, 200, [
            'Content-Type' => 'image/png',
            'Content-Length' => strlen($pixel),
            'Cache-Control' => 'no-cache, no-store, must-revalidate, max-age=0, post-check=0, pre-check=0',
            'Pragma' => 'no-cache',
            'Expires' => 'Sun, 02 Jan 1990 00:00:00 GMT',
        ]);
    }
}
