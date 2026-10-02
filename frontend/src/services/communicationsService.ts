import { api } from '../api/client';
import type { CommunicationsStats, EmailLog, SmsLog } from '../types';

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

export const communicationsService = {
  getStats: () => api.get<CommunicationsStats>('/admin/communications/stats'),
  getEmailLogs: (params?: { status?: string; q?: string; page?: number; per_page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.q) searchParams.append('q', params.q);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    const query = searchParams.toString();
    return api.get<PaginatedResponse<EmailLog>>(`/admin/communications/emails${query ? `?${query}` : ''}`);
  },
  getSmsLogs: (params?: { status?: string; q?: string; page?: number; per_page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.q) searchParams.append('q', params.q);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    const query = searchParams.toString();
    return api.get<PaginatedResponse<SmsLog>>(`/admin/communications/sms${query ? `?${query}` : ''}`);
  },
};
