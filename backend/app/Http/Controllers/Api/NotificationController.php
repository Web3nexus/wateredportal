<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PortalNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get recent notifications and unread count for current user
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = PortalNotification::query();

        if ($user->role === 'admin') {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereNull('user_id');
            });
        } else {
            $query->where('user_id', $user->id);
        }

        $unreadCount = (clone $query)->where('is_read', false)->count();

        $notifications = $query->latest()
            ->take(20)
            ->get();

        return response()->json([
            'unread_count' => $unreadCount,
            'notifications' => $notifications,
        ]);
    }

    /**
     * Mark a single notification as read
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $query = PortalNotification::where('id', $id);
        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }

        $notification = $query->firstOrFail();
        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read.',
            'notification' => $notification,
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = PortalNotification::where('is_read', false);

        if ($user->role === 'admin') {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereNull('user_id');
            });
        } else {
            $query->where('user_id', $user->id);
        }

        $query->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->json([
            'message' => 'All notifications marked as read.',
        ]);
    }
}
