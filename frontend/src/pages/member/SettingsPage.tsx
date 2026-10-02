import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { memberService } from '../../services/memberService';
import {
  Shield,
  Key,
  Bell,
  Eye,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Mail,
  Lock,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Preference State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [scanAlerts, setScanAlerts] = useState(true);
  const [publicVerify, setPublicVerify] = useState(true);
  const [prefLoading, setPrefLoading] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState<string | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await memberService.updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setPasswordSuccess('Your password has been successfully updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(
        err?.response?.data?.message || err?.message || 'Failed to update password. Please check your current password.'
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setPrefLoading(true);
    setPrefSuccess(null);
    try {
      await memberService.updatePreferences({
        email_notifications: emailAlerts,
        sms_notifications: smsAlerts,
        public_verification: publicVerify,
      });
      setPrefSuccess('Your preferences have been saved.');
      setTimeout(() => setPrefSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to save preferences', err);
    } finally {
      setPrefLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 block mb-1">
          Account & Preferences
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your login password, communication alerts, and pass privacy controls.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Account Profile Summary */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase() || 'M'}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-slate-900 truncate">{user?.name}</h3>
                <span className="text-xs text-slate-500 font-mono truncate block">
                  {user?.member?.member_number || 'Member'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Email Address:</span>
                <span className="text-slate-700 font-medium truncate block">{user?.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Account Role:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mt-0.5">
                  Verified Member
                </span>
              </div>
            </div>
          </div>

          {/* Session & Sign Out Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Active Session
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your session is authenticated via secure Sanctum bearer tokens.
            </p>
            <button
              onClick={() => logout().then(() => window.location.assign('/login'))}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors mt-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Portal</span>
            </button>
          </div>
        </div>

        {/* Right Column: Forms & Controls */}
        <div className="md:col-span-8 space-y-8">
          {/* Section 1: Change Password Form */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Change Password</h3>
                <p className="text-xs text-slate-500">Update your account authentication password</p>
              </div>
            </div>

            {passwordSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter your current password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Minimum 8 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat new password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs"
                >
                  {passwordLoading ? 'Updating Password...' : 'Save New Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Notification & Alert Preferences */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Notification Preferences</h3>
                <p className="text-xs text-slate-500">Configure how you receive announcements and alerts</p>
              </div>
            </div>

            {prefSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{prefSuccess}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-slate-600" />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      Email Announcements
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Receive notices and organization updates via email
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-4 h-4 text-slate-600" />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      SMS Security & Urgent Alerts
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Receive instant SMS delivery via Twilio for critical alerts
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-slate-600" />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      Pass Scan Alerts
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Notify me whenever my digital pass is verified at a checkpoint
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={scanAlerts}
                  onChange={(e) => setScanAlerts(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Section 3: Pass Privacy */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                Pass Privacy Controls
              </h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center space-x-3">
                    <Eye className="w-4 h-4 text-slate-600" />
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">
                        Public Pass Verification
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Allow event organizers to verify my name and category via public QR link
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={publicVerify}
                    onChange={(e) => setPublicVerify(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={prefLoading}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs"
              >
                {prefLoading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
