<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\MessageRecipient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class MemberController extends Controller
{
    public function card(Request $request): JsonResponse
    {
        $user = $request->user();
        $member = $user->member;

        if (!$member) {
            return response()->json([
                'message' => 'No active member credential attached to this account.',
            ], 404);
        }

        $member->load(['category', 'profile']);
        $profile = $member->profile;
        $category = $member->category;

        return response()->json([
            'card' => [
                'member_id' => $member->id,
                'member_number' => $member->member_number,
                'status' => $member->status,
                'full_name' => $profile ? $profile->full_name : $user->name,
                'photograph_url' => $profile?->photograph_url,
                'category' => $category ? [
                    'id' => $category->id,
                    'name' => $category->name,
                    'code' => $category->code,
                    'badge_color' => $category->badge_color,
                    'rank' => $category->rank,
                ] : null,
                'joined_at' => $member->joined_at?->format('Y-m-d'),
                'valid_until' => $member->valid_until?->format('Y-m-d'),
                'secure_qr_id' => $member->secure_qr_id,
            ],
        ]);
    }

    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();
        $member = $user->member;

        if (!$member) {
            return response()->json([
                'message' => 'No active member profile found.',
            ], 404);
        }

        $member->load(['category', 'profile']);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'member' => [
                'id' => $member->id,
                'member_number' => $member->member_number,
                'status' => $member->status,
                'joined_at' => $member->joined_at?->format('Y-m-d'),
                'valid_until' => $member->valid_until?->format('Y-m-d'),
                'secure_qr_id' => $member->secure_qr_id,
                'category' => $member->category,
            ],
            'profile' => $member->profile,
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $member = $user->member;

        if (!$member || !$member->profile) {
            return response()->json(['message' => 'Profile not found.'], 404);
        }

        $profile = $member->profile;

        $validated = $request->validate([
            'phone' => ['nullable', 'string', 'max:50'],
            'current_location' => ['nullable', 'string', 'max:150'],
            'occupation' => ['nullable', 'string', 'max:150'],
            'workplace' => ['nullable', 'string', 'max:150'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'first_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['nullable', 'string', 'max:100'],
            'place_of_birth' => ['nullable', 'string', 'max:150'],
            'photograph' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ]);

        if ($request->hasFile('photograph')) {
            $path = $request->file('photograph')->store('members', 'public');
            $profile->photograph_path = $path;
        }

        $profile->update([
            'phone' => $validated['phone'] ?? $profile->phone,
            'current_location' => $validated['current_location'] ?? $profile->current_location,
            'occupation' => $validated['occupation'] ?? $profile->occupation,
            'workplace' => $validated['workplace'] ?? $profile->workplace,
            'bio' => $validated['bio'] ?? $profile->bio,
        ]);

        if (!empty($validated['first_name']) && $validated['first_name'] !== $profile->first_name) {
            $pending = $profile->pending_profile_update ?? [];
            $pending['first_name'] = $validated['first_name'];
            $pending['last_name'] = $validated['last_name'] ?? $profile->last_name;
            $pending['requested_at'] = now()->toIso8601String();
            $profile->pending_profile_update = $pending;
            $profile->save();
        }

        AuditLog::record('member_profile_updated', $member, [
            'member_number' => $member->member_number,
        ], $user);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'profile' => $profile->fresh(),
        ]);
    }

    public function messages(Request $request): JsonResponse
    {
        $user = $request->user();
        $member = $user->member;

        if (!$member) {
            return response()->json(['messages' => [], 'unread_count' => 0]);
        }

        $query = MessageRecipient::with(['message.sender', 'message.category'])
            ->where('member_id', $member->id);

        if ($request->query('status') === 'unread') {
            $query->where('is_read', false);
        } elseif ($request->query('status') === 'archived') {
            $query->where('is_archived', true);
        } else {
            $query->where('is_archived', false);
        }

        $recipients = $query->orderBy('created_at', 'desc')->paginate(15);

        $unreadCount = MessageRecipient::where('member_id', $member->id)
            ->where('is_read', false)
            ->count();

        return response()->json([
            'messages' => $recipients,
            'unread_count' => $unreadCount,
        ]);
    }

    public function showMessage(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $member = $user->member;

        $recipient = MessageRecipient::with(['message.sender', 'message.category'])
            ->where('member_id', $member->id)
            ->where('id', $id)
            ->firstOrFail();

        if (!$recipient->is_read) {
            $recipient->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }

        return response()->json([
            'message_item' => $recipient,
        ]);
    }

    public function markMessageRead(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $member = $user->member;

        $recipient = MessageRecipient::where('member_id', $member->id)
            ->where('id', $id)
            ->firstOrFail();

        $isRead = (bool) $request->input('is_read', true);
        $recipient->update([
            'is_read' => $isRead,
            'read_at' => $isRead ? now() : null,
        ]);

        return response()->json([
            'message' => 'Status updated.',
            'is_read' => $recipient->is_read,
        ]);
    }

    public function archiveMessage(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $member = $user->member;

        $recipient = MessageRecipient::where('member_id', $member->id)
            ->where('id', $id)
            ->firstOrFail();

        $isArchived = !$recipient->is_archived;
        $recipient->update([
            'is_archived' => $isArchived,
            'archived_at' => $isArchived ? now() : null,
        ]);

        return response()->json([
            'message' => $isArchived ? 'Message moved to archive.' : 'Message restored to inbox.',
            'is_archived' => $isArchived,
        ]);
    }

    /**
     * Update member account password
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'The provided current password does not match our records.',
                'errors' => ['current_password' => ['Incorrect current password.']],
            ], 422);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        AuditLog::record('member_password_updated', $user->member, [], $user);

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }

    /**
     * Update member notification and privacy preferences
     */
    public function updatePreferences(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email_notifications' => ['nullable', 'boolean'],
            'sms_notifications' => ['nullable', 'boolean'],
            'public_verification' => ['nullable', 'boolean'],
            'show_workplace' => ['nullable', 'boolean'],
        ]);

        $user = $request->user();
        $member = $user->member;

        if ($member && $member->profile) {
            $pending = $member->profile->pending_profile_update ?? [];
            $pending['preferences'] = $validated;
            $member->profile->pending_profile_update = $pending;
            $member->profile->save();
        }

        AuditLog::record('member_preferences_updated', $member, $validated, $user);

        return response()->json([
            'message' => 'Preferences updated successfully.',
            'preferences' => $validated,
        ]);
    }
}
