<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Member;
use App\Models\MembershipApplication;
use App\Models\MembershipCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PublicController extends Controller
{
    public function categories(): JsonResponse
    {
        $categories = MembershipCategory::where('is_active', true)
            ->orderBy('rank', 'asc')
            ->get(['id', 'name', 'code', 'description', 'badge_color', 'rank']);

        return response()->json([
            'categories' => $categories,
        ]);
    }

    public function apply(Request $request): JsonResponse
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
            'photograph' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ]);

        $photographPath = null;
        if ($request->hasFile('photograph')) {
            $path = $request->file('photograph')->store('applicants', 'public');
            $photographPath = $path;
        } elseif ($request->filled('photograph_url')) {
            $photographPath = $request->input('photograph_url');
        }

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
            'photograph_path' => $photographPath,
            'personal_statement' => $validated['personal_statement'] ?? null,
            'status' => 'pending',
        ]);

        AuditLog::create([
            'action' => 'membership_application_submitted',
            'target_type' => MembershipApplication::class,
            'target_id' => $application->id,
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
            'details' => [
                'application_number' => $appNumber,
                'category_id' => $validated['membership_category_id'],
                'applicant_name' => "{$validated['first_name']} {$validated['last_name']}",
            ],
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Your membership application has been received into the MyWater register.',
            'application' => [
                'application_number' => $application->application_number,
                'status' => $application->status,
                'submitted_at' => $application->created_at->toIso8601String(),
            ],
        ], 201);
    }

    public function verify(string $secureId): JsonResponse
    {
        $member = Member::with(['category', 'profile'])
            ->where('secure_qr_id', $secureId)
            ->first();

        if (!$member) {
            return response()->json([
                'verified' => false,
                'message' => 'The scanned identifier does not correspond to any valid MyWater credential.',
            ], 404);
        }

        $profile = $member->profile;
        $category = $member->category;

        return response()->json([
            'verified' => true,
            'member' => [
                'member_number' => $member->member_number,
                'status' => $member->status,
                'full_name' => $profile ? $profile->full_name : 'Verified Member',
                'photograph_url' => $profile?->photograph_url,
                'category_name' => $category?->name ?? 'General',
                'category_badge_color' => $category?->badge_color ?? '#d4af37',
                'joined_year' => $member->joined_at ? $member->joined_at->format('Y') : null,
                'verified_at' => now()->toIso8601String(),
            ],
        ]);
    }
}
