<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CommunicationsController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Middleware\EnsureAdmin;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/securegate', [AuthController::class, 'secureGateLogin']);
Route::get('/categories', [PublicController::class, 'categories']);
Route::post('/applications', [PublicController::class, 'apply']);
Route::get('/verify/{secureId}', [PublicController::class, 'verify']);
Route::get('/settings/public', [SettingsController::class, 'getPublicSettings']);
Route::get('/track/email/{token}.png', [CommunicationsController::class, 'trackEmail']);

/*
|--------------------------------------------------------------------------
| Authenticated User Routes (auth:sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Notifications (accessible by members and administrators)
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    // Member Specific Routes
    Route::prefix('member')->group(function () {
        Route::get('/card', [MemberController::class, 'card']);
        Route::get('/profile', [MemberController::class, 'profile']);
        Route::patch('/profile', [MemberController::class, 'updateProfile']);
        Route::post('/password', [MemberController::class, 'updatePassword']);
        Route::post('/preferences', [MemberController::class, 'updatePreferences']);
        Route::get('/messages', [MemberController::class, 'messages']);
        Route::get('/messages/{id}', [MemberController::class, 'showMessage']);
        Route::patch('/messages/{id}/read', [MemberController::class, 'markMessageRead']);
        Route::patch('/messages/{id}/archive', [MemberController::class, 'archiveMessage']);
    });
});

/*
|--------------------------------------------------------------------------
| Authenticated Administrative Routes (auth:sanctum + EnsureAdmin)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', EnsureAdmin::class])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);

    Route::get('/applications', [AdminController::class, 'applications']);
    Route::get('/applications/{id}', [AdminController::class, 'showApplication']);
    Route::post('/applications/{id}/approve', [AdminController::class, 'approveApplication']);
    Route::post('/applications/{id}/reject', [AdminController::class, 'rejectApplication']);
    Route::post('/applications/{id}/request-info', [AdminController::class, 'requestInfoApplication']);

    Route::get('/members', [AdminController::class, 'members']);
    Route::get('/members/{id}', [AdminController::class, 'showMember']);
    Route::patch('/members/{id}/status', [AdminController::class, 'updateMemberStatus']);
    Route::patch('/members/{id}/category', [AdminController::class, 'updateMemberCategory']);

    Route::get('/categories', [AdminController::class, 'categories']);
    Route::post('/categories', [AdminController::class, 'storeCategory']);
    Route::patch('/categories/{id}', [AdminController::class, 'updateCategory']);

    Route::post('/messages/preview', [AdminController::class, 'recipientPreview']);
    Route::get('/messages', [AdminController::class, 'messages']);
    Route::post('/messages', [AdminController::class, 'sendMessage']);

    Route::get('/audit-logs', [AdminController::class, 'auditLogs']);

    // System Settings (SMTP, SMS Gateway, Branding Assets)
    Route::get('/settings', [SettingsController::class, 'getSettings']);
    Route::post('/settings', [SettingsController::class, 'updateSettings']);
    Route::post('/settings/upload-asset', [SettingsController::class, 'uploadAsset']);
    Route::post('/settings/test-smtp', [SettingsController::class, 'testSmtp']);
    Route::post('/settings/test-sms', [SettingsController::class, 'testSms']);

    // Sending Accounts Management (Type 2 Engine: Multiple Mail Accounts for Messaging)
    Route::get('/sending-accounts', [\App\Http\Controllers\Api\SendingAccountController::class, 'index']);
    Route::post('/sending-accounts', [\App\Http\Controllers\Api\SendingAccountController::class, 'store']);
    Route::get('/sending-accounts/{id}', [\App\Http\Controllers\Api\SendingAccountController::class, 'show']);
    Route::patch('/sending-accounts/{id}', [\App\Http\Controllers\Api\SendingAccountController::class, 'update']);
    Route::delete('/sending-accounts/{id}', [\App\Http\Controllers\Api\SendingAccountController::class, 'destroy']);
    Route::post('/sending-accounts/{id}/default', [\App\Http\Controllers\Api\SendingAccountController::class, 'setDefault']);
    Route::post('/sending-accounts/{id}/test', [\App\Http\Controllers\Api\SendingAccountController::class, 'test']);

    // Email Templates Management
    Route::get('/templates', [\App\Http\Controllers\Api\EmailTemplateController::class, 'index']);
    Route::get('/templates/{id}', [\App\Http\Controllers\Api\EmailTemplateController::class, 'show']);
    Route::patch('/templates/{id}', [\App\Http\Controllers\Api\EmailTemplateController::class, 'update']);
    Route::post('/templates/{id}/preview', [\App\Http\Controllers\Api\EmailTemplateController::class, 'preview']);

    // Communications Tracking & Analytics
    Route::get('/communications/stats', [CommunicationsController::class, 'stats']);
    Route::get('/communications/emails', [CommunicationsController::class, 'emailLogs']);
    Route::get('/communications/sms', [CommunicationsController::class, 'smsLogs']);
});
