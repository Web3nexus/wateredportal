import { api } from '../api/client';
import type { EmailTemplate } from '../types';

export const templateService = {
  getTemplates: () => api.get<{ templates: EmailTemplate[] }>('/admin/templates'),
  getTemplate: (id: number) => api.get<{ template: EmailTemplate }>(`/admin/templates/${id}`),
  updateTemplate: (id: number, data: { subject: string; body: string; is_active?: boolean }) =>
    api.patch<{ message: string; template: EmailTemplate }>(`/admin/templates/${id}`, data),
  previewTemplate: (id: number, data?: Record<string, string>) =>
    api.post<{ rendered_subject: string; rendered_body: string; html: string }>(
      `/admin/templates/${id}/preview`,
      data
    ),
};
