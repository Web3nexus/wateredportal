import React, { useState, useEffect } from 'react';
import {
  Mail,
  Smartphone,
  Palette,
  Check,
  AlertCircle,
  Upload,
  Send,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import type { BrandingSettings, SmtpSettings, SmsSettings } from '../../types';

interface AdminSettingsPageProps {
  initialTab?: 'smtp' | 'sms' | 'branding';
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({ initialTab = 'smtp' }) => {
  const [activeTab, setActiveTab] = useState<'smtp' | 'sms' | 'branding'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // SMTP state
  const [smtp, setSmtp] = useState<SmtpSettings>({
    smtp_host: '127.0.0.1',
    smtp_port: 1025,
    smtp_username: '',
    smtp_password: '',
    smtp_encryption: 'tls',
    smtp_from_address: 'noreply@mywatered.com',
    smtp_from_name: 'Watered',
  });
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);

  // SMS state
  const [sms, setSms] = useState<SmsSettings>({
    sms_enabled: '1',
    sms_provider: 'twilio',
    twilio_account_sid: '',
    twilio_auth_token: '',
    twilio_from_number: '',
  });
  const [showTwilioToken, setShowTwilioToken] = useState(false);

  // Branding state
  const [branding, setBranding] = useState<BrandingSettings>({
    site_name: 'Watered',
    parent_website_url: 'http://mywatered.com/',
    site_logo_url: '',
    favicon_url: '',
    email_logo_url: '',
    primary_color: '#2563eb',
  });

  // Diagnostics Modals
  const [testEmailOpen, setTestEmailOpen] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  const [testSmsOpen, setTestSmsOpen] = useState(false);
  const [testSmsPhone, setTestSmsPhone] = useState('');
  const [testSmsLoading, setTestSmsLoading] = useState(false);
  const [testSmsResult, setTestSmsResult] = useState<{ success: boolean; message: string; simulated?: boolean } | null>(null);

  // Asset upload status
  const [uploadingAsset, setUploadingAsset] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsService.getAllSettings();
      if (res.settings) {
        if (res.settings.smtp) setSmtp((prev) => ({ ...prev, ...res.settings.smtp }));
        if (res.settings.sms) setSms((prev) => ({ ...prev, ...res.settings.sms }));
        if (res.settings.branding) setBranding((prev) => ({ ...prev, ...res.settings.branding }));
      }
    } catch (e: any) {
      setNotification({ type: 'error', message: e.message || 'Failed to load system settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsService.updateSettings({ smtp: smtp as any });
      setNotification({ type: 'success', message: 'SMTP settings successfully updated.' });
    } catch (e: any) {
      setNotification({ type: 'error', message: e.message || 'Failed to save SMTP settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSms = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsService.updateSettings({ sms: sms as any });
      setNotification({ type: 'success', message: 'SMS Gateway credentials successfully updated.' });
    } catch (e: any) {
      setNotification({ type: 'error', message: e.message || 'Failed to save SMS settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsService.updateSettings({ branding: branding as any });
      setNotification({ type: 'success', message: 'Branding and asset settings updated.' });
    } catch (e: any) {
      setNotification({ type: 'error', message: e.message || 'Failed to save branding settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAssetUpload = async (assetType: 'site_logo' | 'favicon' | 'email_logo', file: File) => {
    try {
      setUploadingAsset(assetType);
      const res = await settingsService.uploadAsset(assetType, file);
      if (assetType === 'site_logo') setBranding((b) => ({ ...b, site_logo_url: res.url }));
      if (assetType === 'favicon') setBranding((b) => ({ ...b, favicon_url: res.url }));
      if (assetType === 'email_logo') setBranding((b) => ({ ...b, email_logo_url: res.url }));
      setNotification({ type: 'success', message: `${assetType.replace('_', ' ')} uploaded successfully.` });
    } catch (e: any) {
      setNotification({ type: 'error', message: e.message || 'Asset upload failed.' });
    } finally {
      setUploadingAsset(null);
    }
  };

  const handleTestSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailRecipient) return;
    try {
      setTestEmailLoading(true);
      setTestEmailResult(null);
      const res = await settingsService.testSmtp({
        recipient_email: testEmailRecipient,
        ...smtp,
      });
      setTestEmailResult(res);
    } catch (e: any) {
      setTestEmailResult({ success: false, message: e.message || 'Failed to dispatch test email.' });
    } finally {
      setTestEmailLoading(false);
    }
  };

  const handleTestSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testSmsPhone) return;
    try {
      setTestSmsLoading(true);
      setTestSmsResult(null);
      const res = await settingsService.testSms({
        recipient_phone: testSmsPhone,
        twilio_account_sid: sms.twilio_account_sid,
        twilio_auth_token: sms.twilio_auth_token,
        twilio_from_number: sms.twilio_from_number,
      });
      setTestSmsResult(res);
    } catch (e: any) {
      setTestSmsResult({ success: false, message: e.message || 'Failed to dispatch test SMS.' });
    } finally {
      setTestSmsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 text-slate-500 space-x-2">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
        <span className="text-xs font-medium">Loading system settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-200/80 gap-4">
        <div>
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
            Portal Infrastructure & Gateways
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            System Settings & Communication Gateways
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure SMTP email transfer parameters, Twilio SMS gateway credentials, and Watered branding assets
          </p>
        </div>

        <button
          onClick={fetchSettings}
          className="p-2.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition self-start shadow-xs cursor-pointer"
          title="Reload settings"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Global alert feedback */}
      {notification && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs font-semibold underline opacity-70 hover:opacity-100 ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-4 sm:space-x-8">
        <button
          onClick={() => setActiveTab('smtp')}
          className={`pb-3.5 text-xs sm:text-sm font-semibold flex items-center space-x-2 border-b-2 transition cursor-pointer ${
            activeTab === 'smtp'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Email System (SMTP)</span>
        </button>

        <button
          onClick={() => setActiveTab('sms')}
          className={`pb-3.5 text-xs sm:text-sm font-semibold flex items-center space-x-2 border-b-2 transition cursor-pointer ${
            activeTab === 'sms'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Twilio SMS Gateway</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`pb-3.5 text-xs sm:text-sm font-semibold flex items-center space-x-2 border-b-2 transition cursor-pointer ${
            activeTab === 'branding'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Branding & Media Assets</span>
        </button>
      </div>

      {/* TAB 1: SMTP CONFIGURATION */}
      {activeTab === 'smtp' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Outbound SMTP Parameters
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Transactional mail credentials for admission approvals, password resets, and announcements.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTestEmailOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition cursor-pointer shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Test Relay</span>
              </button>
            </div>

            <form onSubmit={handleSaveSmtp} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={smtp.smtp_host}
                    onChange={(e) => setSmtp({ ...smtp, smtp_host: e.target.value })}
                    placeholder="e.g. smtp.mailgun.org or 127.0.0.1"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Port
                  </label>
                  <input
                    type="number"
                    value={smtp.smtp_port}
                    onChange={(e) => setSmtp({ ...smtp, smtp_port: e.target.value })}
                    placeholder="587"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Encryption
                  </label>
                  <select
                    value={smtp.smtp_encryption}
                    onChange={(e) => setSmtp({ ...smtp, smtp_encryption: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="tls">TLS (Standard)</option>
                    <option value="ssl">SSL</option>
                    <option value="none">None / Local Port</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    value={smtp.smtp_username}
                    onChange={(e) => setSmtp({ ...smtp, smtp_username: e.target.value })}
                    placeholder="SMTP Username or API Key"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showSmtpPassword ? 'text' : 'password'}
                    value={smtp.smtp_password || ''}
                    onChange={(e) => setSmtp({ ...smtp, smtp_password: e.target.value })}
                    placeholder={smtp.smtp_password ? '••••••••' : 'Enter SMTP password'}
                    className="w-full px-3.5 py-2.5 pr-10 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showSmtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Credentials are encrypted on disk. Leave masked unless updating the secret.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Sender From Name
                  </label>
                  <input
                    type="text"
                    value={smtp.smtp_from_name}
                    onChange={(e) => setSmtp({ ...smtp, smtp_from_name: e.target.value })}
                    placeholder="Watered"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Sender From Email
                  </label>
                  <input
                    type="email"
                    value={smtp.smtp_from_address}
                    onChange={(e) => setSmtp({ ...smtp, smtp_from_address: e.target.value })}
                    placeholder="noreply@mywatered.com"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save SMTP Settings'}
                </button>
              </div>
            </form>
          </div>

          {/* Side Info */}
          <div className="space-y-6">
            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-6 text-sm text-slate-700 space-y-3">
              <h3 className="font-bold text-slate-900 text-base">
                Open Tracking Telemetry
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                All outbound transactional emails sent via the Watered gateway automatically embed an encrypted 1×1 transparent beacon.
              </p>
              <div className="p-3 bg-white border border-blue-200 rounded-xl text-xs font-mono text-blue-700">
                GET /api/track/email/{'{token}'}.png
              </div>
              <p className="text-xs text-slate-500">
                When the recipient opens the email in Gmail or Outlook, their client pings this route and increments the open count in the analytics dashboard.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SMS GATEWAY CONFIGURATION */}
      {activeTab === 'sms' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Twilio SMS Gateway Configuration
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct SMS dispatch for member security verification, admission alerts, and urgent bulletins.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTestSmsOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs font-semibold transition cursor-pointer shadow-2xs"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Test SMS</span>
              </button>
            </div>

            <form onSubmit={handleSaveSms} className="space-y-5">
              <div className="flex items-center space-x-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <input
                  type="checkbox"
                  id="sms_enabled"
                  checked={sms.sms_enabled === '1' || sms.sms_enabled === true}
                  onChange={(e) => setSms({ ...sms, sms_enabled: e.target.checked ? '1' : '0' })}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="sms_enabled" className="text-xs font-semibold text-slate-800">
                  Enable Outbound SMS Gateway Dispatch
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Twilio Account SID
                </label>
                <input
                  type="text"
                  value={sms.twilio_account_sid}
                  onChange={(e) => setSms({ ...sms, twilio_account_sid: e.target.value })}
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Twilio Auth Token
                </label>
                <div className="relative">
                  <input
                    type={showTwilioToken ? 'text' : 'password'}
                    value={sms.twilio_auth_token || ''}
                    onChange={(e) => setSms({ ...sms, twilio_auth_token: e.target.value })}
                    placeholder={sms.twilio_auth_token ? '••••••••' : 'Enter Twilio Auth Token'}
                    className="w-full px-3.5 py-2.5 pr-10 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTwilioToken(!showTwilioToken)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showTwilioToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Twilio From Phone Number
                </label>
                <input
                  type="text"
                  value={sms.twilio_from_number}
                  onChange={(e) => setSms({ ...sms, twilio_from_number: e.target.value })}
                  placeholder="+18005550199"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-blue-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  E.164 formatted telephone number registered in your Twilio Console.
                </p>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save SMS Gateway Settings'}
                </button>
              </div>
            </form>
          </div>

          {/* Side Info */}
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm text-slate-700 space-y-3">
              <h3 className="font-bold text-slate-900 text-base">
                Simulated Sandbox Fallback
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                If live Twilio credentials are not set, dispatches automatically execute in sandbox simulation mode. The messages are recorded in the communications telemetry log without consuming API credits.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BRANDING & ASSETS */}
      {activeTab === 'branding' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Asset Management Form */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Brand Identity & Assets
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update portal name, parent site URL (http://mywatered.com/), brand color, and logo files.
                </p>
              </div>

              <form onSubmit={handleSaveBranding} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Portal Name
                  </label>
                  <input
                    type="text"
                    value={branding.site_name}
                    onChange={(e) => setBranding({ ...branding, site_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Parent Website URL
                  </label>
                  <input
                    type="url"
                    value={branding.parent_website_url}
                    onChange={(e) => setBranding({ ...branding, parent_website_url: e.target.value })}
                    placeholder="http://mywatered.com/"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Primary link displayed in headers, footers, and email dispatches.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={branding.primary_color || '#2563eb'}
                      onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                      className="w-10 h-10 border border-slate-200 rounded-xl cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={branding.primary_color}
                      onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                      className="px-3.5 py-2 text-xs border border-slate-200 rounded-xl font-mono uppercase focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? 'Saving...' : 'Save Brand Settings'}
                  </button>
                </div>
              </form>

              {/* Upload Sections */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                  Media Asset Files
                </h3>

                {/* 1. Site Logo */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden p-1 shadow-2xs">
                      <img src={branding.site_logo_url || '/logo.png'} alt="Site Logo" className="max-w-full max-h-full object-contain" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Site Header Logo</p>
                      <p className="text-[11px] text-slate-500">PNG, SVG or WebP • Recommended height 48px</p>
                    </div>
                  </div>
                  <div>
                    <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium rounded-xl shadow-xs transition">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>{uploadingAsset === 'site_logo' ? 'Uploading...' : 'Replace'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleAssetUpload('site_logo', e.target.files[0]);
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* 2. Favicon */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden p-2 shadow-2xs">
                      <img src={branding.favicon_url || '/favicon.png'} alt="Favicon" className="max-w-full max-h-full object-contain" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Browser Favicon</p>
                      <p className="text-[11px] text-slate-500">ICO, PNG or SVG • 32×32 or 64×64 pixels</p>
                    </div>
                  </div>
                  <div>
                    <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium rounded-xl shadow-xs transition">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>{uploadingAsset === 'favicon' ? 'Uploading...' : 'Replace'}</span>
                      <input
                        type="file"
                        accept="image/x-icon,image/png,image/svg+xml"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleAssetUpload('favicon', e.target.files[0]);
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* 3. Email Template Logo */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden p-1 shadow-2xs">
                      <img src={branding.email_logo_url || '/logo.png'} alt="Email Logo" className="max-w-full max-h-full object-contain" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Email Template Logo</p>
                      <p className="text-[11px] text-slate-500">Rendered in the header bar of all outbound emails</p>
                    </div>
                  </div>
                  <div>
                    <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium rounded-xl shadow-xs transition">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>{uploadingAsset === 'email_logo' ? 'Uploading...' : 'Replace'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleAssetUpload('email_logo', e.target.files[0]);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE EMAIL TEMPLATE PREVIEW */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 sm:p-8 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Live Email Rendering Preview
                  </h3>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-semibold">
                  Live View
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                This preview updates in real-time as you modify the portal brand assets and parent website URL.
              </p>

              {/* Rendered Email Canvas */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1 max-w-lg mx-auto w-full">
                {/* Email Header */}
                <div className="bg-slate-900 py-6 px-6 text-center">
                  {branding.email_logo_url || branding.site_logo_url ? (
                    <img
                      src={branding.email_logo_url || branding.site_logo_url}
                      alt="Watered Logo"
                      className="max-h-10 mx-auto object-contain"
                    />
                  ) : (
                    <div className="w-10 h-10 mx-auto rounded-xl bg-blue-600 text-white font-bold text-xl flex items-center justify-center">
                      W
                    </div>
                  )}
                  <h4 className="text-white text-xs uppercase tracking-widest font-semibold mt-2.5">
                    {branding.site_name || 'Watered'}
                  </h4>
                </div>

                {/* Email Body */}
                <div className="p-6 text-slate-800 text-xs space-y-4 leading-relaxed">
                  <p className="font-bold text-slate-900 text-sm">
                    Admission Notice & Digital Credentials
                  </p>
                  <p>
                    Greetings Member,
                  </p>
                  <p>
                    Your application for the Watered member register has been approved by the Administration. Your encrypted digital membership card is now activated.
                  </p>
                  <div className="bg-slate-50 border-l-3 border-blue-600 p-3 text-[11px] font-mono text-slate-700 rounded-r-lg">
                    Member ID: W-000104<br />
                    Portal: https://wateredportal.test/securegate
                  </div>
                  <div className="pt-2 text-center">
                    <span className="inline-block px-5 py-2 bg-blue-600 text-white text-[11px] font-semibold rounded-lg shadow-xs">
                      Access Member Portal
                    </span>
                  </div>
                </div>

                {/* Email Footer */}
                <div className="bg-slate-50 border-t border-slate-100 py-4 px-6 text-center text-[11px] text-slate-500">
                  <p>© {branding.site_name || 'Watered'} • All Rights Reserved</p>
                  <a
                    href={branding.parent_website_url || 'http://mywatered.com/'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline mt-1 inline-block font-medium"
                  >
                    {branding.parent_website_url || 'http://mywatered.com/'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DIAGNOSTIC TEST EMAIL MODAL */}
      {testEmailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <Send className="w-4 h-4 text-blue-600" />
                <span>SMTP Diagnostic Relay Test</span>
              </h3>
              <button
                onClick={() => setTestEmailOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Send a test message through the configured SMTP host to verify handshake, TLS credentials, and open-tracking.
            </p>

            <form onSubmit={handleTestSmtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  placeholder="admin@example.org"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              {testEmailResult && (
                <div
                  className={`p-3 rounded-xl text-xs ${
                    testEmailResult.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {testEmailResult.message}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTestEmailOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={testEmailLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {testEmailLoading ? 'Dispatching...' : 'Dispatch Test Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIAGNOSTIC TEST SMS MODAL */}
      {testSmsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-teal-600" />
                <span>Twilio SMS Diagnostic Test</span>
              </h3>
              <button
                onClick={() => setTestSmsOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Transmit a diagnostic SMS to verify Twilio API credentials and E.164 phone routing.
            </p>

            <form onSubmit={handleTestSms} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Recipient Telephone Number
                </label>
                <input
                  type="tel"
                  value={testSmsPhone}
                  onChange={(e) => setTestSmsPhone(e.target.value)}
                  placeholder="+14155552671"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-mono"
                  required
                />
              </div>

              {testSmsResult && (
                <div
                  className={`p-3 rounded-xl text-xs ${
                    testSmsResult.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {testSmsResult.message}
                  {testSmsResult.simulated && (
                    <span className="block mt-1 font-semibold text-amber-700">
                      (Simulated dispatch recorded in database)
                    </span>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTestSmsOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={testSmsLoading}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {testSmsLoading ? 'Dispatching...' : 'Dispatch Test SMS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
