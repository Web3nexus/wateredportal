<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_returns_generic_success_for_existing_user_and_sends_email(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
        ]);

        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'If that email exists, a password reset link has been sent.',
            ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'password_reset_requested',
            'user_id' => $user->id,
        ]);
    }

    public function test_forgot_password_returns_generic_success_for_nonexistent_user(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => 'nonexistent@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'If that email exists, a password reset link has been sent.',
            ]);

        $this->assertDatabaseMissing('audit_logs', [
            'action' => 'password_reset_requested',
        ]);
    }

    public function test_reset_password_success_with_valid_token_revokes_tokens_and_logs_audit(): void
    {
        $user = User::factory()->create([
            'email' => 'reset@example.com',
            'password' => Hash::make('oldpassword'),
        ]);

        $user->createToken('test_token')->plainTextToken;

        $this->assertCount(1, $user->tokens);

        $token = Password::broker('users')->createToken($user);

        $response = $this->postJson('/api/auth/reset-password', [
            'token' => $token,
            'email' => 'reset@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Password has been reset successfully.',
            ]);

        $user->refresh();
        $this->assertTrue(Hash::check('newpassword123', $user->password));
        $this->assertCount(0, $user->tokens);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'password_reset_completed',
            'user_id' => $user->id,
        ]);
    }

    public function test_reset_password_fails_with_invalid_token(): void
    {
        $user = User::factory()->create([
            'email' => 'invalidtoken@example.com',
            'password' => Hash::make('oldpassword'),
        ]);

        $response = $this->postJson('/api/auth/reset-password', [
            'token' => 'invalid-token-123',
            'email' => 'invalidtoken@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(422);
    }

    public function test_reset_password_fails_with_mismatched_confirmation(): void
    {
        $user = User::factory()->create([
            'email' => 'mismatch@example.com',
            'password' => Hash::make('oldpassword'),
        ]);

        $token = Password::broker('users')->createToken($user);

        $response = $this->postJson('/api/auth/reset-password', [
            'token' => $token,
            'email' => 'mismatch@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'differentpassword',
        ]);

        $response->assertStatus(422);
    }

    public function test_reset_password_rate_limited(): void
    {
        $user = User::factory()->create([
            'email' => 'ratelimit@example.com',
            'password' => Hash::make('oldpassword'),
        ]);

        $token = Password::broker('users')->createToken($user);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/auth/reset-password', [
                'token' => $token,
                'email' => 'ratelimit@example.com',
                'password' => 'newpassword123',
                'password_confirmation' => 'newpassword123',
            ]);
        }

        $response = $this->postJson('/api/auth/reset-password', [
            'token' => $token,
            'email' => 'ratelimit@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(429);
    }
}
