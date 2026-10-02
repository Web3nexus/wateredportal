<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Regular member login. Admins must not use this login.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our institutional records.'],
            ]);
        }

        // Enforce: Administrator accounts must use the Secure Gate
        if ($user->role === 'admin') {
            return response()->json([
                'message' => 'Administrative accounts must authenticate via the Secure Gate at /securegate.',
                'requires_secure_gate' => true,
            ], 403);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'Your portal account is currently inactive or suspended. Please contact Administration.',
            ], 403);
        }

        $token = $user->createToken('portal_auth_token')->plainTextToken;

        AuditLog::record('user_login', $user, ['email' => $user->email], $user);

        $user->load(['member.category', 'member.profile']);

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
                'avatar' => $user->avatar,
                'member' => $user->member ? [
                    'id' => $user->member->id,
                    'member_number' => $user->member->member_number,
                    'status' => $user->member->status,
                    'secure_qr_id' => $user->member->secure_qr_id,
                    'category' => $user->member->category ? [
                        'id' => $user->member->category->id,
                        'name' => $user->member->category->name,
                        'code' => $user->member->category->code,
                        'badge_color' => $user->member->category->badge_color,
                    ] : null,
                    'profile' => $user->member->profile ? [
                        'first_name' => $user->member->profile->first_name,
                        'last_name' => $user->member->profile->last_name,
                        'full_name' => $user->member->profile->full_name,
                        'photograph_url' => $user->member->profile->photograph_url,
                        'occupation' => $user->member->profile->occupation,
                        'workplace' => $user->member->profile->workplace,
                        'current_location' => $user->member->profile->current_location,
                    ] : null,
                ] : null,
            ],
        ]);
    }

    /**
     * Dedicated Admin Secure Gate login.
     */
    public function secureGateLogin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'passcode' => ['nullable', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our administrator records.'],
            ]);
        }

        // Enforce: Only admin role can enter through the Secure Gate
        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Access denied. The Secure Gate is reserved exclusively for system administrators.',
            ], 403);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'Your administrative account has been deactivated.',
            ], 403);
        }

        $token = $user->createToken('admin_securegate_token')->plainTextToken;

        AuditLog::record('admin_securegate_login', $user, [
            'email' => $user->email,
            'ip' => $request->ip(),
            'passcode_provided' => !empty($validated['passcode']),
        ], $user);

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
                'avatar' => $user->avatar,
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load(['member.category', 'member.profile']);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
                'avatar' => $user->avatar,
                'member' => $user->member ? [
                    'id' => $user->member->id,
                    'member_number' => $user->member->member_number,
                    'status' => $user->member->status,
                    'secure_qr_id' => $user->member->secure_qr_id,
                    'category' => $user->member->category,
                    'profile' => $user->member->profile,
                ] : null,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user) {
            $user->currentAccessToken()->delete();
            AuditLog::record('user_logout', $user, [], $user);
        }

        return response()->json([
            'message' => 'Signed out successfully.',
        ]);
    }
}
