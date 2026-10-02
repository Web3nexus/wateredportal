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
            $status = $request->query('status');
            if ($status === 'active' || $status === 'active_pending') {
                $query->whereIn('status', ['pending', 'under_review', 'contact_required']);
            } elseif ($status !== 'all') {
                $query->where('status', $status);
            }
        } else {
            // Default: Show pending/active applications; approved applications move to Member Directory
            $query->whereIn('status', ['pending', 'under_review', 'contact_required']);
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

    public function storeApplication(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'membership_category_id' => ['required', 'exists:membership_categories,id'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'date_of_birth' => ['nullable', 'date'],
            'place_of_birth' => ['nullable', 'string', 'max:150'],
            'current_location' => ['required', 'string', 'max:150'],
            'occupation' => ['required', 'string', 'max:150'],
            'workplace' => ['required', 'string', 'max:150'],
            'personal_statement' => ['nullable', 'string', 'max:2000'],
            'status' => ['nullable', 'in:pending,under_review,contact_required'],
        ]);

        $appNumber = 'APP-' . date('Y') . '-' . strtoupper(Str::random(6));

        $application = MembershipApplication::create([
            'application_number' => $appNumber,
            'membership_category_id' => $validated['membership_category_id'],
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'date_of_birth' => $validated['date_of_birth'] ?? null,
            'place_of_birth' => $validated['place_of_birth'] ?? null,
            'current_location' => $validated['current_location'],
            'occupation' => $validated['occupation'],
            'workplace' => $validated['workplace'],
            'personal_statement' => $validated['personal_statement'] ?? null,
            'status' => $validated['status'] ?? 'pending',
        ]);

        AuditLog::record('application_manually_created', $application, [
            'application_number' => $appNumber,
            'name' => "{$validated['first_name']} {$validated['last_name']}",
        ], $request->user());

        return response()->json([
            'message' => 'Application created successfully.',
            'application' => $application->load('category'),
        ], 201);
    }

    public function showApplication(int $id): JsonResponse
    {
        $application = MembershipApplication::with(['category', 'reviewer:id,name'])->findOrFail($id);

        return response()->json([
            'application' => $application,
        ]);
    }

    public function updateApplication(Request $request, int $id): JsonResponse
    {
        $application = MembershipApplication::findOrFail($id);

        $validated = $request->validate([
            'membership_category_id' => ['sometimes', 'required', 'exists:membership_categories,id'],
            'first_name' => ['sometimes', 'required', 'string', 'max:100'],
            'last_name' => ['sometimes', 'required', 'string', 'max:100'],
            'email' => ['sometimes', 'required', 'email', 'max:255'],
            'phone' => ['sometimes', 'required', 'string', 'max:50'],
            'date_of_birth' => ['nullable', 'date'],
            'place_of_birth' => ['nullable', 'string', 'max:150'],
            'current_location' => ['sometimes', 'required', 'string', 'max:150'],
            'occupation' => ['sometimes', 'required', 'string', 'max:150'],
            'workplace' => ['sometimes', 'required', 'string', 'max:150'],
            'personal_statement' => ['nullable', 'string', 'max:2000'],
            'status' => ['sometimes', 'required', 'in:pending,under_review,contact_required,approved,rejected,completed'],
            'review_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $application->update($validated);

        AuditLog::record('application_updated', $application, [
            'application_number' => $application->application_number,
        ], $request->user());

        return response()->json([
            'message' => 'Application details updated.',
            'application' => $application->load('category', 'reviewer'),
        ]);
    }

    public function destroyApplication(Request $request, int $id): JsonResponse
    {
        $application = MembershipApplication::findOrFail($id);
        $appNumber = $application->application_number;
        $name = "{$application->first_name} {$application->last_name}";

        $application->delete();

        AuditLog::record('application_deleted', null, [
            'application_number' => $appNumber,
            'name' => $name,
        ], $request->user());

        return response()->json([
            'message' => "Application [{$appNumber}] has been permanently removed.",
        ]);
    }

    public function bulkDeleteApplications(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:membership_applications,id'],
        ]);

        $count = MembershipApplication::whereIn('id', $validated['ids'])->delete();

        AuditLog::record('applications_bulk_deleted', null, [
            'count' => $count,
            'application_ids' => $validated['ids'],
        ], $request->user());

        return response()->json([
            'message' => "Successfully deleted {$count} applications.",
            'count' => $count,
        ]);
    }

    public function bulkApproveApplications(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:membership_applications,id'],
            'review_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $admin = $request->user();
        $applications = MembershipApplication::with('category')
            ->whereIn('id', $validated['ids'])
            ->whereNotIn('status', ['approved', 'completed'])
            ->get();

        $approvedCount = 0;
        foreach ($applications as $app) {
            DB::beginTransaction();
            try {
                $user = User::where('email', $app->email)->first();
                $defaultPassword = 'Welcome@Watered' . date('Y');

                if (!$user) {
                    $user = User::create([
                        'name' => "{$app->first_name} {$app->last_name}",
                        'email' => $app->email,
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
                    'membership_category_id' => $app->membership_category_id,
                    'member_number' => $memberNumber,
                    'secure_qr_id' => 'sec_w_' . Str::random(32),
                    'status' => 'active',
                    'joined_at' => now(),
                    'valid_until' => now()->addYears(2),
                ]);

                MemberProfile::create([
                    'member_id' => $member->id,
                    'first_name' => $app->first_name,
                    'last_name' => $app->last_name,
                    'date_of_birth' => $app->date_of_birth,
                    'place_of_birth' => $app->place_of_birth,
                    'current_location' => $app->current_location,
                    'phone' => $app->phone,
                    'occupation' => $app->occupation,
                    'workplace' => $app->workplace,
                    'photograph_path' => $app->photograph_path,
                    'bio' => $app->personal_statement,
                ]);

                $app->update([
                    'status' => 'approved',
                    'reviewer_id' => $admin->id,
                    'reviewed_at' => now(),
                    'review_notes' => $validated['review_notes'] ?? 'Bulk approved by administration.',
                ]);

                AuditLog::record('application_approved', $app, [
                    'member_number' => $memberNumber,
                    'application_number' => $app->application_number,
                ], $admin);

                DB::commit();

                // Send admission email
                EmailService::sendApplicationApprovedEmail($app, $member, $user, $defaultPassword);
                $approvedCount++;
            } catch (\Exception $e) {
                DB::rollBack();
            }
        }

        return response()->json([
            'message' => "Successfully approved and moved {$approvedCount} applications to Member Directory.",
            'approved_count' => $approvedCount,
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

        // Dispatch notification email to applicant
        EmailService::sendApplicationRejectedEmail($application, $validated['review_notes']);

        return response()->json([
            'message' => 'Application rejected and notification email sent to applicant.',
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

        // Dispatch contact / information request email to applicant
        EmailService::sendApplicationContactRequiredEmail($application, $validated['review_notes']);

        return response()->json([
            'message' => 'Application marked for contact and email sent to applicant.',
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

    public function storeMember(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:50'],
            'membership_category_id' => ['required', 'exists:membership_categories,id'],
            'status' => ['nullable', 'in:active,pending,suspended,deactivated'],
            'occupation' => ['nullable', 'string', 'max:150'],
            'workplace' => ['nullable', 'string', 'max:150'],
            'current_location' => ['nullable', 'string', 'max:150'],
            'initial_password' => ['nullable', 'string', 'min:8'],
            'valid_until' => ['nullable', 'date'],
            'bio' => ['nullable', 'string', 'max:2000'],
        ]);

        $admin = $request->user();
        $defaultPassword = $validated['initial_password'] ?? 'Welcome@Watered' . date('Y');

        DB::beginTransaction();
        try {
            $user = User::create([
                'name' => "{$validated['first_name']} {$validated['last_name']}",
                'email' => $validated['email'],
                'password' => Hash::make($defaultPassword),
                'role' => 'member',
                'status' => in_array($validated['status'] ?? 'active', ['active', 'pending']) ? 'active' : 'suspended',
            ]);

            $lastMember = Member::orderBy('id', 'desc')->first();
            $nextSequence = $lastMember ? ($lastMember->id + 100) : 100;
            $memberNumber = 'W-' . str_pad((string) $nextSequence, 6, '0', STR_PAD_LEFT);

            $member = Member::create([
                'user_id' => $user->id,
                'membership_category_id' => $validated['membership_category_id'],
                'member_number' => $memberNumber,
                'secure_qr_id' => 'sec_w_' . Str::random(32),
                'status' => $validated['status'] ?? 'active',
                'joined_at' => now(),
                'valid_until' => !empty($validated['valid_until']) ? $validated['valid_until'] : now()->addYears(2),
            ]);

            MemberProfile::create([
                'member_id' => $member->id,
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'phone' => $validated['phone'],
                'current_location' => $validated['current_location'] ?? null,
                'occupation' => $validated['occupation'] ?? null,
                'workplace' => $validated['workplace'] ?? null,
                'bio' => $validated['bio'] ?? null,
            ]);

            AuditLog::record('member_manually_registered', $member, [
                'member_number' => $memberNumber,
                'name' => "{$validated['first_name']} {$validated['last_name']}",
                'email' => $user->email,
            ], $admin);

            DB::commit();

            // Send admission credentials email
            $category = MembershipCategory::find($validated['membership_category_id']);
            $dummyApp = new MembershipApplication([
                'application_number' => 'REG-' . strtoupper(Str::random(6)),
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $user->email,
            ]);
            $dummyApp->category = $category;
            EmailService::sendApplicationApprovedEmail($dummyApp, $member, $user, $defaultPassword);

            return response()->json([
                'message' => 'Member successfully registered into the directory and credentials sent.',
                'member' => $member->load(['user', 'category', 'profile']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to register member: ' . $e->getMessage()], 500);
        }
    }

    public function updateMember(Request $request, int $id): JsonResponse
    {
        $member = Member::with(['user', 'profile'])->findOrFail($id);

        $validated = $request->validate([
            'first_name' => ['sometimes', 'required', 'string', 'max:100'],
            'last_name' => ['sometimes', 'required', 'string', 'max:100'],
            'email' => ['sometimes', 'required', 'email', 'max:255', 'unique:users,email,' . ($member->user_id ?? 0)],
            'phone' => ['nullable', 'string', 'max:50'],
            'membership_category_id' => ['sometimes', 'required', 'exists:membership_categories,id'],
            'status' => ['sometimes', 'required', 'in:active,pending,suspended,deactivated'],
            'occupation' => ['nullable', 'string', 'max:150'],
            'workplace' => ['nullable', 'string', 'max:150'],
            'current_location' => ['nullable', 'string', 'max:150'],
            'valid_until' => ['nullable', 'date'],
            'joined_at' => ['nullable', 'date'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'new_password' => ['nullable', 'string', 'min:8'],
        ]);

        DB::beginTransaction();
        try {
            // Update User
            if ($member->user) {
                $userData = [];
                if (isset($validated['first_name']) || isset($validated['last_name'])) {
                    $fn = $validated['first_name'] ?? $member->profile?->first_name;
                    $ln = $validated['last_name'] ?? $member->profile?->last_name;
                    $userData['name'] = trim("{$fn} {$ln}");
                }
                if (isset($validated['email'])) {
                    $userData['email'] = $validated['email'];
                }
                if (isset($validated['status'])) {
                    $userData['status'] = in_array($validated['status'], ['active', 'pending']) ? 'active' : 'suspended';
                }
                if (!empty($validated['new_password'])) {
                    $userData['password'] = Hash::make($validated['new_password']);
                }
                if (!empty($userData)) {
                    $member->user->update($userData);
                }
            }

            // Update Member
            $oldCategory = $member->membership_category_id;
            $memberData = [];
            if (isset($validated['membership_category_id'])) {
                $memberData['membership_category_id'] = $validated['membership_category_id'];
            }
            if (isset($validated['status'])) {
                $memberData['status'] = $validated['status'];
            }
            if (isset($validated['valid_until'])) {
                $memberData['valid_until'] = $validated['valid_until'];
            }
            if (isset($validated['joined_at'])) {
                $memberData['joined_at'] = $validated['joined_at'];
            }
            if (!empty($memberData)) {
                $member->update($memberData);
            }

            // Update Profile
            if ($member->profile) {
                $profileData = array_intersect_key($validated, array_flip([
                    'first_name', 'last_name', 'phone', 'current_location', 'occupation', 'workplace', 'bio'
                ]));
                if (!empty($profileData)) {
                    $member->profile->update($profileData);
                }
            }

            AuditLog::record('member_record_updated', $member, [
                'member_number' => $member->member_number,
            ], $request->user());

            // If category changed, trigger upgrade notification email
            if (isset($validated['membership_category_id']) && $oldCategory != $validated['membership_category_id']) {
                $newCat = MembershipCategory::find($validated['membership_category_id']);
                if ($newCat) {
                    EmailService::sendMemberUpgradedEmail($member, $newCat, 'Registry profile updated by administration.');
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Member details updated successfully.',
                'member' => $member->fresh(['user', 'category', 'profile']),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to update member: ' . $e->getMessage()], 500);
        }
    }

    public function destroyMember(Request $request, int $id): JsonResponse
    {
        $member = Member::with('user')->findOrFail($id);
        $memberNumber = $member->member_number;
        $userName = $member->user?->name ?? 'Member';

        DB::beginTransaction();
        try {
            $user = $member->user;
            $member->delete();

            // Also delete associated member user account if it is not an admin
            if ($user && $user->role === 'member') {
                $user->tokens()->delete();
                $user->delete();
            }

            AuditLog::record('member_deleted', null, [
                'member_number' => $memberNumber,
                'name' => $userName,
            ], $request->user());

            DB::commit();

            return response()->json([
                'message' => "Member [{$memberNumber}] ({$userName}) has been permanently deleted from the directory.",
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to delete member: ' . $e->getMessage()], 500);
        }
    }

    public function bulkDeleteMembers(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:members,id'],
        ]);

        $members = Member::with('user')->whereIn('id', $validated['ids'])->get();
        $deletedCount = 0;

        foreach ($members as $member) {
            DB::beginTransaction();
            try {
                $user = $member->user;
                $member->delete();

                if ($user && $user->role === 'member') {
                    $user->tokens()->delete();
                    $user->delete();
                }

                $deletedCount++;
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
            }
        }

        AuditLog::record('members_bulk_deleted', null, [
            'count' => $deletedCount,
            'member_ids' => $validated['ids'],
        ], $request->user());

        return response()->json([
            'message' => "Successfully deleted {$deletedCount} members from the directory.",
            'count' => $deletedCount,
        ]);
    }

    public function bulkUpdateMemberStatus(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:members,id'],
            'status' => ['required', 'in:active,suspended,deactivated,pending'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $members = Member::with('user')->whereIn('id', $validated['ids'])->get();
        $updatedCount = 0;

        foreach ($members as $member) {
            $member->update(['status' => $validated['status']]);
            if ($member->user) {
                $member->user->update([
                    'status' => in_array($validated['status'], ['active', 'pending']) ? 'active' : 'suspended',
                ]);
            }
            $updatedCount++;
        }

        AuditLog::record('members_bulk_status_updated', null, [
            'count' => $updatedCount,
            'status' => $validated['status'],
            'reason' => $validated['reason'] ?? null,
            'member_ids' => $validated['ids'],
        ], $request->user());

        return response()->json([
            'message' => "Successfully updated status of {$updatedCount} members to {$validated['status']}.",
            'count' => $updatedCount,
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
            'target_type' => ['required', 'in:all,category,individual,multiple'],
            'membership_category_id' => ['nullable', 'required_if:target_type,category', 'exists:membership_categories,id'],
            'target_member_id' => ['nullable', 'required_if:target_type,individual', 'exists:members,id'],
            'target_member_ids' => ['nullable', 'array'],
            'target_member_ids.*' => ['integer', 'exists:members,id'],
        ]);

        $query = Member::where('status', 'active');

        if ($validated['target_type'] === 'category') {
            $query->where('membership_category_id', $validated['membership_category_id']);
        } elseif ($validated['target_type'] === 'individual') {
            $query->where('id', $validated['target_member_id']);
        } elseif ($validated['target_type'] === 'multiple' && !empty($validated['target_member_ids'])) {
            $query->whereIn('id', $validated['target_member_ids']);
        }

        $count = $query->count();
        $sample = $query->with('profile:member_id,first_name,last_name')->take(10)->get();

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
            'target_type' => ['required', 'in:all,category,individual,multiple'],
            'membership_category_id' => ['nullable', 'required_if:target_type,category', 'exists:membership_categories,id'],
            'target_member_id' => ['nullable', 'required_if:target_type,individual', 'exists:members,id'],
            'target_member_ids' => ['nullable', 'array'],
            'target_member_ids.*' => ['integer', 'exists:members,id'],
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
        } elseif ($validated['target_type'] === 'multiple' && !empty($validated['target_member_ids'])) {
            $query->whereIn('id', $validated['target_member_ids']);
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
