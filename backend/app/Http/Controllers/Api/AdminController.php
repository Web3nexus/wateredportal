<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Member;
use App\Models\MemberProfile;
use App\Models\MembershipApplication;
use App\Models\MembershipCategory;
use App\Models\Message;
use App\Models\MessageRecipient;
use App\Models\SendingEmailAccount;
use App\Models\User;
use App\Services\EmailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $activeMembersCount = Member::where('status', 'active')->count();
        $pendingApplicationsCount = MembershipApplication::whereIn('status', ['pending', 'under_review'])->count();
        $totalMessagesCount = Message::count();

        $categoryDistribution = MembershipCategory::withCount('members')
            ->orderBy('rank', 'asc')
            ->get(['id', 'name', 'code', 'badge_color', 'members_count']);

        $recentApplications = MembershipApplication::with('category')
            ->latest()
            ->take(5)
            ->get();

        $recentAudits = AuditLog::with('user:id,name,email')
            ->latest('created_at')
            ->take(6)
            ->get();

        return response()->json([
            'stats' => [
                'active_members' => $activeMembersCount,
                'pending_applications' => $pendingApplicationsCount,
                'total_messages' => $totalMessagesCount,
            ],
            'category_distribution' => $categoryDistribution,
            'recent_applications' => $recentApplications,
            'recent_audits' => $recentAudits,
        ]);
    }

    public function applications(Request $request): JsonResponse
    {
        $query = MembershipApplication::with(['category', 'reviewer:id,name']);

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('category_id')) {
            $query->where('membership_category_id', $request->query('category_id'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('application_number', 'like', "%{$search}%");
            });
        }

        $applications = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'applications' => $applications,
        ]);
    }

    public function showApplication(int $id): JsonResponse
    {
        $application = MembershipApplication::with(['category', 'reviewer:id,name'])->findOrFail($id);

        return response()->json([
            'application' => $application,
        ]);
    }

    public function approveApplication(Request $request, int $id): JsonResponse
    {
        $application = MembershipApplication::findOrFail($id);

        if ($application->status === 'approved' || $application->status === 'completed') {
            return response()->json(['message' => 'Application has already been approved.'], 400);
        }

        $validated = $request->validate([
            'review_notes' => ['nullable', 'string', 'max:1000'],
            'initial_password' => ['nullable', 'string', 'min:8'],
        ]);

        $admin = $request->user();

        DB::beginTransaction();
        try {
            $user = User::where('email', $application->email)->first();
            $defaultPassword = $validated['initial_password'] ?? 'Welcome@Watered' . date('Y');

            if (!$user) {
                $user = User::create([
                    'name' => "{$application->first_name} {$application->last_name}",
                    'email' => $application->email,
                    'password' => Hash::make($defaultPassword),
                    'role' => 'member',
                    'status' => 'active',
                ]);
            } else {
                $user->update(['role' => 'member', 'status' => 'active']);
            }

            $lastMember = Member::orderBy('id', 'desc')->first();
            $nextSequence = $lastMember ? ($lastMember->id + 100) : 100;
            $memberNumber = 'W-' . str_pad((string) $nextSequence, 6, '0', STR_PAD_LEFT);

            $member = Member::create([
                'user_id' => $user->id,
                'membership_category_id' => $application->membership_category_id,
                'member_number' => $memberNumber,
                'secure_qr_id' => 'sec_w_' . Str::random(32),
                'status' => 'active',
                'joined_at' => now(),
                'valid_until' => now()->addYears(2),
            ]);

            MemberProfile::create([
                'member_id' => $member->id,
                'first_name' => $application->first_name,
                'last_name' => $application->last_name,
                'date_of_birth' => $application->date_of_birth,
                'place_of_birth' => $application->place_of_birth,
                'current_location' => $application->current_location,
                'phone' => $application->phone,
                'occupation' => $application->occupation,
                'workplace' => $application->workplace,
                'photograph_path' => $application->photograph_path,
                'bio' => $application->personal_statement,
            ]);

            $application->update([
                'status' => 'approved',
                'reviewer_id' => $admin->id,
                'review_notes' => $validated['review_notes'] ?? 'Application verified and admitted into roll.',
                'reviewed_at' => now(),
                'user_id' => $user->id,
            ]);

            $welcomeMsg = Message::create([
                'sender_id' => $admin->id,
                'subject' => 'Official Admission into Watered Register',
                'body' => "Greetings {$application->first_name},\n\nYour application ({$application->application_number}) has been approved by the Administration Council.\n\nYou have been issued Member ID: {$memberNumber}.\nYour Digital Membership Card and verified portal access are now activated.\n\nWelcome to Watered.",
                'target_type' => 'individual',
                'target_member_id' => $member->id,
                'priority' => 'high',
            ]);

            MessageRecipient::create([
                'message_id' => $welcomeMsg->id,
                'member_id' => $member->id,
                'is_read' => false,
            ]);

            AuditLog::record('application_approved', $application, [
                'application_number' => $application->application_number,
                'member_number' => $memberNumber,
                'member_id' => $member->id,
            ], $admin);

            DB::commit();

            // Dispatch official admission approval email to member with credentials
            EmailService::sendApplicationApprovedEmail($application, $member, $user, $defaultPassword);

            return response()->json([
                'message' => 'Applicant successfully admitted and member credential issued.',
                'member_number' => $memberNumber,
                'member_id' => $member->id,
                'temporary_credentials' => [
                    'email' => $user->email,
                    'password' => $defaultPassword,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to approve application: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function rejectApplication(Request $request, int $id): JsonResponse
    {
        $application = MembershipApplication::findOrFail($id);

        $validated = $request->validate([
            'review_notes' => ['required', 'string', 'max:1000'],
        ]);

        $admin = $request->user();

        $application->update([
            'status' => 'rejected',
            'reviewer_id' => $admin->id,
            'review_notes' => $validated['review_notes'],
            'reviewed_at' => now(),
        ]);

        AuditLog::record('application_rejected', $application, [
            'application_number' => $application->application_number,
            'reason' => $validated['review_notes'],
        ], $admin);

        return response()->json([
            'message' => 'Application rejected and logged.',
            'application' => $application,
        ]);
    }

    public function requestInfoApplication(Request $request, int $id): JsonResponse
    {
        $application = MembershipApplication::findOrFail($id);

        $validated = $request->validate([
            'review_notes' => ['required', 'string', 'max:1000'],
        ]);

        $admin = $request->user();

        $application->update([
            'status' => 'contact_required',
            'reviewer_id' => $admin->id,
            'review_notes' => $validated['review_notes'],
            'reviewed_at' => now(),
        ]);

        AuditLog::record('application_contact_required', $application, [
            'application_number' => $application->application_number,
            'notes' => $validated['review_notes'],
        ], $admin);

        return response()->json([
            'message' => 'Application marked for contact / additional information.',
            'application' => $application,
        ]);
    }

    public function members(Request $request): JsonResponse
    {
        $query = Member::with(['user:id,name,email,status', 'category', 'profile']);

        if ($request->filled('category_id')) {
            $query->where('membership_category_id', $request->query('category_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('member_number', 'like', "%{$search}%")
                    ->orWhereHas('profile', function ($pq) use ($search) {
                        $pq->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    })
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('email', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%");
                    });
            });
        }

        $members = $query->orderBy('id', 'desc')->paginate(15);

        return response()->json([
            'members' => $members,
        ]);
    }

    public function showMember(int $id): JsonResponse
    {
        $member = Member::with([
            'user',
            'category',
            'profile',
            'messageRecipients.message.sender:id,name',
        ])->findOrFail($id);

        return response()->json([
            'member' => $member,
        ]);
    }

    public function updateMemberStatus(Request $request, int $id): JsonResponse
    {
        $member = Member::findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'in:active,suspended,deactivated,pending'],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $oldStatus = $member->status;
        $member->status = $validated['status'];
        $member->save();

        if ($member->user) {
            $member->user->update([
                'status' => in_array($validated['status'], ['active', 'pending']) ? 'active' : 'suspended',
            ]);
        }

        AuditLog::record('member_status_changed', $member, [
            'member_number' => $member->member_number,
            'old_status' => $oldStatus,
            'new_status' => $validated['status'],
            'reason' => $validated['reason'] ?? null,
        ], $request->user());

        return response()->json([
            'message' => "Member status updated to {$validated['status']}.",
            'member' => $member->load('category', 'profile'),
        ]);
    }

    public function updateMemberCategory(Request $request, int $id): JsonResponse
    {
        $member = Member::findOrFail($id);

        $validated = $request->validate([
            'membership_category_id' => ['required', 'exists:membership_categories,id'],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $oldCategory = $member->membership_category_id;
        $member->membership_category_id = $validated['membership_category_id'];
        $member->save();

        AuditLog::record('member_category_reassigned', $member, [
            'member_number' => $member->member_number,
            'old_category_id' => $oldCategory,
            'new_category_id' => $validated['membership_category_id'],
            'reason' => $validated['reason'] ?? null,
        ], $request->user());

        // Dispatch membership tier upgrade notification email
        if ($oldCategory != $validated['membership_category_id']) {
            $newCategory = MembershipCategory::find($validated['membership_category_id']);
            if ($newCategory) {
                EmailService::sendMemberUpgradedEmail($member, $newCategory, $validated['reason'] ?? null);
            }
        }

        return response()->json([
            'message' => 'Member category reassigned and upgrade notification sent.',
            'member' => $member->load('category', 'profile'),
        ]);
    }

    public function categories(): JsonResponse
    {
        $categories = MembershipCategory::withCount('members')
            ->orderBy('rank', 'asc')
            ->get();

        return response()->json([
            'categories' => $categories,
        ]);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:100', 'unique:membership_categories,code'],
            'description' => ['nullable', 'string', 'max:1000'],
            'badge_color' => ['nullable', 'string', 'max:20'],
            'rank' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $category = MembershipCategory::create([
            'name' => $validated['name'],
            'code' => Str::slug($validated['code'], '_'),
            'description' => $validated['description'] ?? null,
            'badge_color' => $validated['badge_color'] ?? '#d4af37',
            'rank' => $validated['rank'] ?? 10,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        AuditLog::record('category_created', $category, [
            'category_name' => $category->name,
        ], $request->user());

        return response()->json([
            'message' => 'Membership category created successfully.',
            'category' => $category,
        ], 201);
    }

    public function updateCategory(Request $request, int $id): JsonResponse
    {
        $category = MembershipCategory::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
            'badge_color' => ['nullable', 'string', 'max:20'],
            'rank' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $category->update($validated);

        AuditLog::record('category_updated', $category, [
            'category_name' => $category->name,
        ], $request->user());

        return response()->json([
            'message' => 'Category updated successfully.',
            'category' => $category,
        ]);
    }

    public function recipientPreview(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'target_type' => ['required', 'in:all,category,individual'],
            'membership_category_id' => ['nullable', 'required_if:target_type,category', 'exists:membership_categories,id'],
            'target_member_id' => ['nullable', 'required_if:target_type,individual', 'exists:members,id'],
        ]);

        $query = Member::where('status', 'active');

        if ($validated['target_type'] === 'category') {
            $query->where('membership_category_id', $validated['membership_category_id']);
        } elseif ($validated['target_type'] === 'individual') {
            $query->where('id', $validated['target_member_id']);
        }

        $count = $query->count();
        $sample = $query->with('profile:member_id,first_name,last_name')->take(5)->get();

        return response()->json([
            'count' => $count,
            'target_type' => $validated['target_type'],
            'sample_recipients' => $sample->map(fn($m) => [
                'id' => $m->id,
                'member_number' => $m->member_number,
                'name' => $m->profile ? $m->profile->full_name : $m->member_number,
            ]),
        ]);
    }

    public function sendMessage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:10000'],
            'target_type' => ['required', 'in:all,category,individual'],
            'membership_category_id' => ['nullable', 'required_if:target_type,category', 'exists:membership_categories,id'],
            'target_member_id' => ['nullable', 'required_if:target_type,individual', 'exists:members,id'],
            'priority' => ['nullable', 'in:normal,high,urgent'],
            'sending_account_id' => ['nullable', 'exists:sending_email_accounts,id'],
            'send_email' => ['nullable', 'boolean'],
        ]);

        $admin = $request->user();

        // Resolve sending email account (Type 2 Engine)
        $sendingAccount = null;
        if (!empty($validated['sending_account_id'])) {
            $sendingAccount = SendingEmailAccount::find($validated['sending_account_id']);
        } else {
            $sendingAccount = SendingEmailAccount::where('is_default', true)->first() 
                ?: SendingEmailAccount::where('is_active', true)->first();
        }

        $query = Member::where('status', 'active');
        if ($validated['target_type'] === 'category') {
            $query->where('membership_category_id', $validated['membership_category_id']);
        } elseif ($validated['target_type'] === 'individual') {
            $query->where('id', $validated['target_member_id']);
        }

        $members = $query->with(['user:id,name,email', 'profile'])->get();

        if ($members->isEmpty()) {
            return response()->json([
                'message' => 'No active members match the specified targeting criteria.',
            ], 422);
        }

        DB::beginTransaction();
        try {
            $message = Message::create([
                'sender_id' => $admin->id,
                'sending_account_id' => $sendingAccount?->id,
                'subject' => $validated['subject'],
                'body' => $validated['body'],
                'target_type' => $validated['target_type'],
                'membership_category_id' => $validated['membership_category_id'] ?? null,
                'target_member_id' => $validated['target_member_id'] ?? null,
                'priority' => $validated['priority'] ?? 'normal',
            ]);

            $recipientsData = [];
            $now = now();
            foreach ($members as $member) {
                $recipientsData[] = [
                    'message_id' => $message->id,
                    'member_id' => $member->id,
                    'is_read' => false,
                    'read_at' => null,
                    'is_archived' => false,
                    'archived_at' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            MessageRecipient::insert($recipientsData);

            AuditLog::record('broadcast_dispatched', $message, [
                'subject' => $message->subject,
                'target_type' => $message->target_type,
                'recipient_count' => count($recipientsData),
                'sending_account' => $sendingAccount?->name ?? 'Default Notification Gateway',
            ], $admin);

            DB::commit();

            // Dispatch outbound emails to member inboxes if requested (default true)
            $shouldSendEmail = $request->boolean('send_email', true);
            if ($shouldSendEmail) {
                foreach ($members as $member) {
                    EmailService::sendMessageNotification($member, $message, $sendingAccount);
                }
            }

            return response()->json([
                'message' => 'Message successfully dispatched to ' . count($recipientsData) . ' member inbox(es)' . ($shouldSendEmail ? ' and emailed via ' . ($sendingAccount?->name ?? 'system mailer') : '') . '.',
                'message_id' => $message->id,
                'recipient_count' => count($recipientsData),
                'sending_account' => $sendingAccount ? [
                    'id' => $sendingAccount->id,
                    'name' => $sendingAccount->name,
                    'from_email' => $sendingAccount->from_email,
                ] : null,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Broadcast failed: ' . $e->getMessage()], 500);
        }
    }

    public function messages(): JsonResponse
    {
        $messages = Message::with(['category', 'targetMember.profile', 'sendingAccount', 'sender:id,name'])
            ->withCount([
                'recipients',
                'recipients as read_count' => function ($q) {
                    $q->where('is_read', true);
                }
            ])
            ->latest()
            ->paginate(15);

        return response()->json([
            'messages' => $messages,
        ]);
    }

    public function auditLogs(Request $request): JsonResponse
    {
        $query = AuditLog::with('user:id,name,email');

        if ($request->filled('action')) {
            $query->where('action', $request->query('action'));
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(25);

        return response()->json([
            'logs' => $logs,
        ]);
    }
}
