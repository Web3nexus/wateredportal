import { api } from '../api/client';
import { MembershipCategory, PublicVerificationResult } from '../types';

export interface ApplyApplicationData {
  membership_category_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  place_of_birth?: string;
  current_location: string;
  occupation: string;
  workplace: string;
  personal_statement?: string;
  photograph_url?: string;
}

export const publicService = {
  async getCategories(): Promise<{ categories: MembershipCategory[] }> {
    return api.get<{ categories: MembershipCategory[] }>('/categories');
  },

  async apply(data: FormData | ApplyApplicationData): Promise<{
    message: string;
    application: { application_number: string; status: string; submitted_at: string };
  }> {
    return api.post('/applications', data);
  },

  async verifyCredential(secureId: string): Promise<PublicVerificationResult> {
    return api.get<PublicVerificationResult>(`/verify/${encodeURIComponent(secureId)}`);
  },
};

