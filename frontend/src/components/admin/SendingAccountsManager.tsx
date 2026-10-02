import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import type { SendingEmailAccount } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  Send,
  Plus,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  Star,
  RefreshCw,
  Eye,
  EyeOff,
  Server,
  Mail,
  ShieldCheck,
} from 'lucide-react';

export const SendingAccountsManager: React.FC = () => {
  const [accounts, setAccounts] = useState<SendingEmailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State for Create/Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Partial<SendingEmailAccount> | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Test Modal State
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testTarget, setTestTarget] = useState<SendingEmailAccount | null>(null);
  const [testRecipient, setTestRecipient] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getSendingAccounts();
      setAccounts(res.accounts);
    } catch (err: any) {
      setError(err?.message || 'Failed to load sending mail accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleOpenCreate = () => {
    setEditingAccount({
      name: '',
      from_name: 'Watered',
      from_email: '',
      reply_to_email: '',
      smtp_host: '127.0.0.1',
      smtp_port: 587,
      smtp_username: '',
      smtp_password: '',
      smtp_encryption: 'tls',
      is_default: accounts.length === 0,
      is_active: true,
      description: '',
    });
    setShowPassword(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (acc: SendingEmailAccount) => {
    setEditingAccount({ ...acc });
    setShowPassword(false);
    setModalOpen(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    try {
      setSaving(true);
      if (editingAccount.id) {
        const res = await adminService.updateSendingAccount(editingAccount.id, editingAccount);
        setNotification({ type: 'success', message: res.message });
      } else {
        const res = await adminService.createSendingAccount(editingAccount);
        setNotification({ type: 'success', message: res.message });
      }
      setModalOpen(false);
      setEditingAccount(null);
      loadAccounts();
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'Failed to save sending account.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (acc: SendingEmailAccount) => {
    if (!confirm(`Are you sure you want to remove sending mailer [${acc.name}]?`)) return;
    try {
      const res = await adminService.deleteSendingAccount(acc.id);
      setNotification({ type: 'success', message: res.message });
      loadAccounts();
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'Failed to delete sending account.' });
    }
  };

  const handleSetDefault = async (acc: SendingEmailAccount) => {
    try {
      const res = await adminService.setDefaultSendingAccount(acc.id);
      setNotification({ type: 'success', message: res.message });
      loadAccounts();
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'Failed to update default account.' });
    }
  };

  const handleOpenTest = (acc: SendingEmailAccount) => {
    setTestTarget(acc);
    setTestRecipient('');
    setTestResult(null);
    setTestModalOpen(true);
  };

  const handleRunTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTarget || !testRecipient) return;

    try {
      setTestLoading(true);
      setTestResult(null);
      const res = await adminService.testSendingAccount(testTarget.id, testRecipient);
      setTestResult({ success: true, message: res.message });
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || 'Failed to dispatch test message.' });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Engine Introduction */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
              <Server className="w-3 h-3 text-indigo-300" />
              <span>Email Engine Type 2: Messaging Senders</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Outbound Messaging & Broadcast Accounts
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Add and maintain multiple verified outbound sending email accounts. When creating broadcasts or dispatching official member announcements, administrators can pick precisely which sender identity to transmit through.
            </p>
          </div>

          <div className="shrink-0 flex items-center space-x-3">
            <button
              onClick={loadAccounts}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs font-semibold"
              title="Refresh Accounts"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm border-0"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Add Sending Account</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Notifications */}
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

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Accounts List */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-2 text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="text-xs">Loading sending mail accounts...</span>
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
            <Mail className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">No Sending Accounts Configured</h3>
            <p className="text-xs text-slate-500 mt-1">
              Add your first outbound sending account to allow administrators to choose email sender identities when broadcasting.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add First Sending Account
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs transition-all relative flex flex-col justify-between ${
                acc.is_default
                  ? 'border-indigo-400 ring-2 ring-indigo-100'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header Bar */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">
                      {acc.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {acc.from_name}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {acc.is_default && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>Default</span>
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        acc.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {acc.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Email Address & Relay Details */}
                <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400 font-medium">From Email:</span>
                    <span className="font-mono font-semibold text-slate-800 text-[11px] truncate max-w-[190px]" title={acc.from_email}>
                      {acc.from_email}
                    </span>
                  </div>

                  {acc.reply_to_email && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-[11px] text-slate-400 font-medium">Reply-To:</span>
                      <span className="font-mono text-slate-700 text-[11px] truncate max-w-[190px]">
                        {acc.reply_to_email}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400 font-medium">SMTP Gateway:</span>
                    <span className="font-mono text-slate-700 text-[11px]">
                      {acc.smtp_host}:{acc.smtp_port}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400 font-medium">Encryption:</span>
                    <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {acc.smtp_encryption || 'none'}
                    </span>
                  </div>
                </div>

                {acc.description && (
                  <p className="text-[11px] text-slate-500 mt-2.5 leading-relaxed line-clamp-2">
                    {acc.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => handleOpenTest(acc)}
                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition text-[11px]"
                  title="Send Diagnostic Test Email"
                >
                  <Send className="w-3 h-3" />
                  <span>Test Relay</span>
                </button>

                <div className="flex items-center space-x-1">
                  {!acc.is_default && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(acc)}
                      className="px-2 py-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 text-[11px] font-medium transition"
                      title="Make Default Sender"
                    >
                      Set Default
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(acc)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                    title="Edit Account"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(acc)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Account"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create / Edit Account */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAccount(null);
        }}
        title={editingAccount?.id ? 'Edit Sending Email Account' : 'New Outbound Sending Account'}
        description="Configure SMTP credentials for this dedicated messaging and broadcast sender profile."
        size="lg"
      >
        {editingAccount && (
          <form onSubmit={handleSaveAccount} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Account Name / Label *
                </label>
                <input
                  type="text"
                  required
                  value={editingAccount.name || ''}
                  onChange={(e) => setEditingAccount({ ...editingAccount, name: e.target.value })}
                  placeholder="e.g. Executive Secretariat"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  From Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingAccount.from_name || ''}
                  onChange={(e) => setEditingAccount({ ...editingAccount, from_name: e.target.value })}
                  placeholder="e.g. Watered Executive Council"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  From Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={editingAccount.from_email || ''}
                  onChange={(e) => setEditingAccount({ ...editingAccount, from_email: e.target.value })}
                  placeholder="executive@mywatered.com"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Reply-To Email Address
                </label>
                <input
                  type="email"
                  value={editingAccount.reply_to_email || ''}
                  onChange={(e) => setEditingAccount({ ...editingAccount, reply_to_email: e.target.value })}
                  placeholder="contact@mywatered.com"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-mono"
                />
              </div>
            </div>

            {/* SMTP Connection Credentials */}
            <div className="border-t border-slate-100 pt-3">
              <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center space-x-1.5">
                <Server className="w-3.5 h-3.5 text-indigo-600" />
                <span>SMTP Relay Gateway</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    SMTP Host *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingAccount.smtp_host || ''}
                    onChange={(e) => setEditingAccount({ ...editingAccount, smtp_host: e.target.value })}
                    placeholder="smtp.mywatered.com or 127.0.0.1"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Port *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingAccount.smtp_port ?? 587}
                    onChange={(e) => setEditingAccount({ ...editingAccount, smtp_port: parseInt(e.target.value, 10) || 587 })}
                    placeholder="587"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Encryption
                  </label>
                  <select
                    value={editingAccount.smtp_encryption || 'tls'}
                    onChange={(e) => setEditingAccount({ ...editingAccount, smtp_encryption: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-indigo-600"
                  >
                    <option value="tls">TLS (Standard)</option>
                    <option value="ssl">SSL (465)</option>
                    <option value="none">None / Plain</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    SMTP Username
                  </label>
                  <input
                    type="text"
                    value={editingAccount.smtp_username || ''}
                    onChange={(e) => setEditingAccount({ ...editingAccount, smtp_username: e.target.value })}
                    placeholder="API user or email"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    SMTP Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={editingAccount.smtp_password || ''}
                      onChange={(e) => setEditingAccount({ ...editingAccount, smtp_password: e.target.value })}
                      placeholder={editingAccount.id ? '••••••••' : 'Password'}
                      className="w-full px-3 py-2 pr-8 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Description / Purpose
              </label>
              <textarea
                rows={2}
                value={editingAccount.description || ''}
                onChange={(e) => setEditingAccount({ ...editingAccount, description: e.target.value })}
                placeholder="e.g. Dedicated sender account for presidential orders, official decrees, and executive communiqués."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex items-center space-x-6 pt-1">
              <label className="inline-flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingAccount.is_default || false}
                  onChange={(e) => setEditingAccount({ ...editingAccount, is_default: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-700">Set as default sending account</span>
              </label>

              <label className="inline-flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingAccount.is_active !== false}
                  onChange={(e) => setEditingAccount({ ...editingAccount, is_active: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-700">Active account</span>
              </label>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setModalOpen(false);
                  setEditingAccount(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={saving}
                className="bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                {editingAccount.id ? 'Save Changes' : 'Create Account'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal: Diagnostic Test Relay */}
      <Modal
        isOpen={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        title={`Test Relay: ${testTarget?.name || 'Sending Account'}`}
        description="Dispatch a live diagnostic test message via this account to verify SMTP handshake and relay delivery."
        size="md"
      >
        <form onSubmit={handleRunTest} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl space-y-1">
            <p className="text-[11px] text-slate-500">
              Sender: <strong className="text-slate-800">{testTarget?.from_name} &lt;{testTarget?.from_email}&gt;</strong>
            </p>
            <p className="text-[11px] text-slate-500">
              Gateway: <span className="font-mono text-slate-700">{testTarget?.smtp_host}:{testTarget?.smtp_port}</span> ({testTarget?.smtp_encryption})
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Recipient Email Address *
            </label>
            <input
              type="email"
              required
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              placeholder="admin@mywatered.com"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
            />
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.success ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{testResult.message}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTestModalOpen(false)}
            >
              Close
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={testLoading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              <span>Send Test Email</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
