import { api } from '../api/client';
import { User } from '../types';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
    return api.post<LoginResponse>('/auth/login', credentials);
  },

  async secureGateLogin(credentials: { email: string; password: string; passcode?: string }): Promise<LoginResponse> {
    return api.post<LoginResponse>('/auth/securegate', credentials);
  },

  async me(): Promise<{ user: User }> {
    return api.get<{ user: User }>('/me');
  },

  async logout(): Promise<{ message: string }> {
    return api.post<{ message: string }>('/auth/logout');
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return api.post<{ message: string }>('/auth/forgot-password', { email });
  },

  async resetPassword(payload: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ message: string }> {
    return api.post<{ message: string }>('/auth/reset-password', payload);
  },

  async validateResetPassword(token: string, email: string): Promise<{ valid: boolean }> {
    return api.get<{ valid: boolean }>(`/auth/reset-password/validate?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
  },
};

