import { api } from '../api/client';
import { CardData, MemberProfile, MessageRecipient, User } from '../types';

export const memberService = {
  async getCard(): Promise<{ card: CardData }> {
    return api.get<{ card: CardData }>('/member/card');
  },

  async getProfile(): Promise<{ user: User; member: any; profile: MemberProfile }> {
    return api.get<{ user: User; member: any; profile: MemberProfile }>('/member/profile');
  },

  async updateProfile(data: FormData | Partial<MemberProfile>): Promise<{
    message: string;
    profile: MemberProfile;
  }> {
    return api.patch('/member/profile', data);
  },

  async updatePassword(data: { current_password: string; password: string; password_confirmation: string }): Promise<{
    message: string;
  }> {
    return api.post('/member/password', data);
  },

  async updatePreferences(preferences: Record<string, boolean>): Promise<{
    message: string;
    preferences: Record<string, boolean>;
  }> {
    return api.post('/member/preferences', preferences);
  },

  async getMessages(status?: 'all' | 'unread' | 'archived', page = 1): Promise<{
    messages: {
      data: MessageRecipient[];
      current_page: number;
      last_page: number;
      total: number;
    };
    unread_count: number;
  }> {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (page > 1) params.append('page', page.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get(`/member/messages${query}`);
  },

  async getMessage(id: number): Promise<{ message_item: MessageRecipient }> {
    return api.get<{ message_item: MessageRecipient }>(`/member/messages/${id}`);
  },

  async markMessageRead(id: number, isRead = true): Promise<{ message: string; is_read: boolean }> {
    return api.patch(`/member/messages/${id}/read`, { is_read: isRead });
  },

  async toggleArchiveMessage(id: number): Promise<{ message: string; is_archived: boolean }> {
    return api.patch(`/member/messages/${id}/archive`);
  },
};

