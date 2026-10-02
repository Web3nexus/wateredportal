import { api } from '../api/client';
import type { AllSettingsResponse, BrandingSettings } from '../types';

export const settingsService = {
  getPublicSettings: () => api.get<BrandingSettings>('/settings/public'),
  getAllSettings: () => api.get<AllSettingsResponse>('/admin/settings'),
  updateSettings: (data: {
    branding?: Record<string, string>;
    smtp?: Record<string, unknown>;
    sms?: Record<string, unknown>;
  }) => api.post<{ message: string }>('/admin/settings', data),
  uploadAsset: (assetType: 'site_logo' | 'favicon' | 'email_logo', file: File) => {
    const formData = new FormData();
    formData.append('asset_type', assetType);
    formData.append('file', file);
    return api.post<{ message: string; asset_type: string; url: string }>(
      '/admin/settings/upload-asset',
      formData
    );
  },
  testSmtp: (data: {
    recipient_email: string;
    smtp_host?: string;
    smtp_port?: number | string;
    smtp_username?: string;
    smtp_password?: string;
    smtp_encryption?: string;
    smtp_from_address?: string;
    smtp_from_name?: string;
  }) => api.post<{ success: boolean; message: string; log_id?: number }>('/admin/settings/test-smtp', data),
  testSms: (data: {
    recipient_phone: string;
    twilio_account_sid?: string;
    twilio_auth_token?: string;
    twilio_from_number?: string;
  }) => api.post<{ success: boolean; message: string; simulated?: boolean; log_id?: number }>('/admin/settings/test-sms', data),
};
