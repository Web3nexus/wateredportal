export type UserRole = 'admin' | 'member';
export type MemberStatus = 'active' | 'pending' | 'suspended' | 'deactivated' | 'inactive' | 'deceased';
export type ApplicationStatus = 'pending' | 'under_review' | 'contact_required' | 'approved' | 'rejected' | 'completed';
export type MessagePriority = 'normal' | 'high' | 'urgent';
export type TargetType = 'all' | 'category' | 'individual';

export interface MembershipCategory {
  id: number;
  name: string;
  code: string;
  slug?: string;
  description?: string;
  criteria?: string;
  badge_color?: string;
  rank: number;
  tier_order?: number;
  is_active: boolean;
  members_count?: number;
}

export interface MemberProfile {
  id: number;
  member_id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  date_of_birth?: string;
  place_of_birth?: string;
  current_location?: string;
  city_country?: string;
  phone?: string;
  occupation?: string;
  vocation?: string;
  workplace?: string;
  photograph_path?: string;
  photograph_url?: string;
  bio?: string;
  pending_profile_update?: {
    first_name?: string;
    last_name?: string;
    requested_at?: string;
    [key: string]: unknown;
  } | null;
}

export interface Member {
  id: number;
  user_id: number;
  membership_category_id: number;
  member_number: string;
  secure_qr_id: string;
  secure_id?: string;
  status: MemberStatus;
  joined_at?: string;
  valid_until?: string;
  created_at?: string;
  category?: MembershipCategory;
  profile?: MemberProfile;
  user?: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'suspended' | 'pending';
  avatar?: string;
  avatar_url?: string;
  member?: Member;
}

export interface MembershipApplication {
  id: number;
  application_number: string;
  membership_category_id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  place_of_birth?: string;
  current_location: string;
  occupation: string;
  workplace: string;
  photograph_path?: string;
  photograph_url?: string;
  personal_statement?: string;
  status: ApplicationStatus;
  reviewer_id?: number;
  reviewer?: { id: number; name: string };
  review_notes?: string;
  reviewed_at?: string;
  created_at: string;
  category?: MembershipCategory;
}

export interface SendingEmailAccount {
  id: number;
  name: string;
  from_name: string;
  from_email: string;
  reply_to_email?: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username?: string;
  smtp_password?: string;
  smtp_encryption: 'tls' | 'ssl' | 'none';
  is_default: boolean;
  is_active: boolean;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Message {
  id: number;
  sender_id: number;
  sender?: { id: number; name: string };
  sending_account_id?: number;
  sending_account?: SendingEmailAccount;
  subject: string;
  body: string;
  target_type: TargetType;
  membership_category_id?: number;
  category?: MembershipCategory;
  target_member_id?: number;
  target_member?: Member;
  priority: MessagePriority;
  created_at: string;
  sent_at?: string;
  recipients_count?: number;
  read_count?: number;
}

export interface MessageRecipient {
  id: number;
  message_id: number;
  member_id: number;
  is_read: boolean;
  read_at?: string;
  is_archived: boolean;
  archived_at?: string;
  created_at: string;
  message?: Message;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  user?: { id: number; name: string; email: string };
  action: string;
  target_type?: string;
  target_id?: number;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface CardData {
  member_id: number;
  member_number: string;
  status: MemberStatus;
  full_name: string;
  photograph_url?: string;
  category: {
    id: number;
    name: string;
    code: string;
    badge_color?: string;
    rank: number;
  } | null;
  joined_at?: string;
  valid_until?: string;
  secure_qr_id: string;
}

export interface PublicVerificationResult {
  verified: boolean;
  member?: {
    member_number: string;
    status: MemberStatus;
    full_name: string;
    photograph_url?: string;
    category_name: string;
    category_badge_color: string;
    joined_year?: string;
    verified_at: string;
  };
  message?: string;
}

export interface PortalNotification {
  id: number;
  user_id?: number | null;
  type: 'registration' | 'communication' | 'system' | 'approval' | 'status' | string;
  title: string;
  message: string;
  action_url?: string | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}

export interface EmailLog {
  id: number;
  recipient_email: string;
  recipient_name?: string | null;
  subject: string;
  status: 'sent' | 'delivered' | 'opened' | 'failed' | string;
  tracking_token: string;
  opened_at?: string | null;
  opens_count: number;
  error_message?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

export interface SmsLog {
  id: number;
  recipient_phone: string;
  recipient_name?: string | null;
  message_body: string;
  status: 'sent' | 'delivered' | 'failed' | string;
  gateway: string;
  external_id?: string | null;
  error_message?: string | null;
  created_at: string;
}

export interface CommunicationsStats {
  email: {
    total_sent: number;
    opened: number;
    unopened: number;
    open_rate: number;
    recent: EmailLog[];
  };
  sms: {
    total_sent: number;
    delivered: number;
    failed: number;
    recent: SmsLog[];
  };
  registrations: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    conversion_rate: number;
  };
}

export interface BrandingSettings {
  site_name: string;
  parent_website_url: string;
  site_logo_url: string;
  favicon_url: string;
  email_logo_url: string;
  primary_color: string;
}

export interface SmtpSettings {
  smtp_host: string;
  smtp_port: number | string;
  smtp_username: string;
  smtp_password?: string;
  smtp_encryption: string;
  smtp_from_address: string;
  smtp_from_name: string;
}

export interface SmsSettings {
  sms_enabled: string | boolean;
  sms_provider: string;
  twilio_account_sid: string;
  twilio_auth_token?: string;
  twilio_from_number: string;
}

export interface AllSettingsResponse {
  settings: {
    branding: BrandingSettings;
    smtp: SmtpSettings;
    sms: SmsSettings;
  };
}

export interface EmailTemplate {
  id: number;
  code: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}


