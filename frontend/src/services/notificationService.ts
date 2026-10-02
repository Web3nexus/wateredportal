import { api } from '../api/client';
import type { PortalNotification } from '../types';

export interface NotificationsResponse {
  unread_count: number;
  notifications: PortalNotification[];
}

export const notificationService = {
  getNotifications: () => api.get<NotificationsResponse>('/notifications'),
  markAsRead: (id: number) => api.patch<{ message: string; notification: PortalNotification }>(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch<{ message: string }>('/notifications/read-all'),
};
