import { api } from '../api/client';
import {
  AuditLog,
  MembershipApplication,
  MembershipCategory,
  Member,
  Message,
  SendingEmailAccount,
} from '../types';

export const adminService = {
  async getDashboard(): Promise<{
    stats: {
      active_members: number;
      pending_applications: number;
      total_messages: number;
    };
    category_distribution: (MembershipCategory & { members_count: number })[];
    recent_applications: MembershipApplication[];
    recent_audits: AuditLog[];
  }> {
    return api.get('/admin/dashboard');
  },

  async getApplications(params: {
    status?: string;
    category_id?: number;
    search?: string;
    page?: number;
  } = {}): Promise<{
    applications: {
      data: MembershipApplication[];
      current_page: number;
      last_page: number;
      total: number;
    };
  }> {
    const q = new URLSearchParams();
    if (params.status) q.append('status', params.status);
    if (params.category_id) q.append('category_id', params.category_id.toString());
    if (params.search) q.append('search', params.search);
    if (params.page) q.append('page', params.page.toString());
    return api.get(`/admin/applications?${q.toString()}`);
  },

  async getApplication(id: number): Promise<{ application: MembershipApplication }> {
    return api.get<{ application: MembershipApplication }>(`/admin/applications/${id}`);
  },

  async approveApplication(id: number, data: { review_notes?: string; initial_password?: string } = {}): Promise<{
    message: string;
    member_number: string;
    member_id: number;
    temporary_credentials: { email: string; password?: string };
  }> {
    return api.post(`/admin/applications/${id}/approve`, data);
  },

  async rejectApplication(id: number, review_notes: string): Promise<{
    message: string;
    application: MembershipApplication;
  }> {
    return api.post(`/admin/applications/${id}/reject`, { review_notes });
  },

  async requestInfoApplication(id: number, review_notes: string): Promise<{
    message: string;
    application: MembershipApplication;
  }> {
    return api.post(`/admin/applications/${id}/request-info`, { review_notes });
  },

  async getMembers(params: {
    category_id?: number;
    status?: string;
    search?: string;
    page?: number;
  } = {}): Promise<{
    members: {
      data: Member[];
      current_page: number;
      last_page: number;
      total: number;
    };
  }> {
    const q = new URLSearchParams();
    if (params.category_id) q.append('category_id', params.category_id.toString());
    if (params.status) q.append('status', params.status);
    if (params.search) q.append('search', params.search);
    if (params.page) q.append('page', params.page.toString());
    return api.get(`/admin/members?${q.toString()}`);
  },

  async getMember(id: number): Promise<{ member: Member }> {
    return api.get<{ member: Member }>(`/admin/members/${id}`);
  },

  async updateMemberStatus(id: number, status: string, reason?: string): Promise<{
    message: string;
    member: Member;
  }> {
    return api.patch(`/admin/members/${id}/status`, { status, reason });
  },

  async updateMemberCategory(id: number, membership_category_id: number, reason?: string): Promise<{
    message: string;
    member: Member;
  }> {
    return api.patch(`/admin/members/${id}/category`, { membership_category_id, reason });
  },

  async getCategories(): Promise<{ categories: (MembershipCategory & { members_count: number })[] }> {
    return api.get('/admin/categories');
  },

  async createCategory(data: Partial<MembershipCategory>): Promise<{
    message: string;
    category: MembershipCategory;
  }> {
    return api.post('/admin/categories', data);
  },

  async updateCategory(id: number, data: Partial<MembershipCategory>): Promise<{
    message: string;
    category: MembershipCategory;
  }> {
    return api.patch(`/admin/categories/${id}`, data);
  },

  async previewRecipients(data: {
    target_type: 'all' | 'category' | 'individual';
    membership_category_id?: number;
    target_member_id?: number;
  }): Promise<{
    count: number;
    target_type: string;
    sample_recipients: { id: number; member_number: string; name: string }[];
  }> {
    return api.post('/admin/messages/preview', data);
  },

  async sendMessage(data: {
    subject: string;
    body: string;
    target_type: 'all' | 'category' | 'individual';
    membership_category_id?: number;
    target_member_id?: number;
    priority?: 'normal' | 'high' | 'urgent';
    sending_account_id?: number;
    send_email?: boolean;
  }): Promise<{
    message: string;
    message_id: number;
    recipient_count: number;
    sending_account?: { id: number; name: string; from_email: string } | null;
  }> {
    return api.post('/admin/messages', data);
  },

  async getSendingAccounts(params: { active_only?: boolean } = {}): Promise<{
    accounts: SendingEmailAccount[];
  }> {
    const q = new URLSearchParams();
    if (params.active_only) q.append('active_only', '1');
    return api.get(`/admin/sending-accounts?${q.toString()}`);
  },

  async getSendingAccount(id: number): Promise<{ account: SendingEmailAccount }> {
    return api.get(`/admin/sending-accounts/${id}`);
  },

  async createSendingAccount(data: Partial<SendingEmailAccount>): Promise<{
    message: string;
    account: SendingEmailAccount;
  }> {
    return api.post('/admin/sending-accounts', data);
  },

  async updateSendingAccount(id: number, data: Partial<SendingEmailAccount>): Promise<{
    message: string;
    account: SendingEmailAccount;
  }> {
    return api.patch(`/admin/sending-accounts/${id}`, data);
  },

  async deleteSendingAccount(id: number): Promise<{ message: string }> {
    return api.delete(`/admin/sending-accounts/${id}`);
  },

  async setDefaultSendingAccount(id: number): Promise<{
    message: string;
    account: SendingEmailAccount;
  }> {
    return api.post(`/admin/sending-accounts/${id}/default`);
  },

  async testSendingAccount(id: number, recipient_email: string): Promise<{
    success: boolean;
    message: string;
    log_id?: number;
  }> {
    return api.post(`/admin/sending-accounts/${id}/test`, { recipient_email });
  },

  async getMessages(page = 1): Promise<{
    messages: {
      data: Message[];
      current_page: number;
      last_page: number;
      total: number;
    };
  }> {
    return api.get(`/admin/messages?page=${page}`);
  },

  async getAuditLogs(action?: string, page = 1): Promise<{
    logs: {
      data: AuditLog[];
      current_page: number;
      last_page: number;
      total: number;
    };
  }> {
    const q = new URLSearchParams();
    if (action) q.append('action', action);
    if (page > 1) q.append('page', page.toString());
    return api.get(`/admin/audit-logs?${q.toString()}`);
  },
};

