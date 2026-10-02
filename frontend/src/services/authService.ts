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
};

