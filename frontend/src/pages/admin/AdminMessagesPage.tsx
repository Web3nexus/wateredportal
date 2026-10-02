import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { Message, MembershipCategory, Member, SendingEmailAccount } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Send,
  Mail,
  AlertCircle,
  CheckCircle,
  Users,
  Eye,
  Server,
  ExternalLink,
} from 'lucide-react';

export const AdminMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [categories, setCategories] = useState<MembershipCategory[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [sendingAccounts, setSendingAccounts] = useState<SendingEmailAccount[]>([]);
  const [selectedSendingAccountId, setSelectedSendingAccountId] = useState<number | undefined>(undefined);
  const [sendOutboundEmail, setSendOutboundEmail] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [targetType, setTargetType] = useState<'all' | 'category' | 'individual' | 'multiple'>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [selectedMemberId, setSelectedMemberId] = useState<number | undefined>(undefined);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Preview State
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [sampleRecipients, setSampleRecipients] = useState<{ id: number; member_number: string; name: string }[]>([]);
  const [isPreviewing, setIsPreviewing] = useState(false);

  // Dispatch State
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  // View Modal State
  const [viewingMessage, setViewingMessage] = useState<Message | null>(null);

  const loadData = () => {
    setIsLoading(true);
    adminService
      .getMessages()
      .then((res) => setMessages(res.messages.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
    adminService.getCategories().then((res) => {
      setCategories(res.categories);
      if (res.categories.length > 0) setSelectedCategoryId(res.categories[0].id);
    });
    adminService.getMembers({ status: 'active' }).then((res) => {
      setMembers(res.members.data);
      if (res.members.data.length > 0) setSelectedMemberId(res.members.data[0].id);
    });
    adminService.getSendingAccounts({ active_only: true }).then((res) => {
      setSendingAccounts(res.accounts);
      const defaultAcc = res.accounts.find((a) => a.is_default) || res.accounts[0];
      if (defaultAcc) {
        setSelectedSendingAccountId(defaultAcc.id);
      }
    });
  }, []);

  const handlePreviewRecipients = async () => {
    setIsPreviewing(true);
    try {
      const res = await adminService.previewRecipients({
        target_type: targetType,
        membership_category_id: targetType === 'category' ? selectedCategoryId : undefined,
        target_member_id: targetType === 'individual' ? selectedMemberId : undefined,
        target_member_ids: targetType === 'multiple' ? selectedMemberIds : undefined,
      });
      setPreviewCount(res.count);
      setSampleRecipients(res.sample_recipients);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsPreviewing(false);
    }
  };

  useEffect(() => {
    handlePreviewRecipients();
  }, [targetType, selectedCategoryId, selectedMemberId, selectedMemberIds]);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      setSendError('Message subject and content body are required.');
      return;
    }

    if (targetType === 'multiple' && selectedMemberIds.length === 0) {
      setSendError('Please select at least one member to receive this message.');
      return;
    }

    setIsSending(true);
    setSendError(null);
    setSendSuccess(null);

    try {
      const res = await adminService.sendMessage({
        subject,
        body,
        priority,
        target_type: targetType,
        membership_category_id: targetType === 'category' ? selectedCategoryId : undefined,
        target_member_id: targetType === 'individual' ? selectedMemberId : undefined,
        target_member_ids: targetType === 'multiple' ? selectedMemberIds : undefined,
        sending_account_id: selectedSendingAccountId,
        send_email: sendOutboundEmail,
      });

      setSendSuccess(res.message || `Broadcast transmitted successfully to ${previewCount ?? 'all'} verified members.`);
      setSubject('');
      setBody('');
      setSelectedMemberIds([]);
      loadData();
    } catch (err: any) {
      setSendError(err.message || 'Transmission failed. Please check network logs.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200/80 gap-4">
        <div>
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
            Member Communications
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Broadcast Messages & Announcements
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Compose and dispatch multi-channel announcements to all active members, specific categories, or individuals
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Dispatch Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-2 pb-3 mb-5 border-b border-slate-100">
            <Send className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Draft Announcement</h2>
          </div>

          {sendSuccess && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2.5 text-emerald-800 text-xs">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{sendSuccess}</span>
            </div>
          )}

          {sendError && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2.5 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{sendError}</span>
            </div>
          )}

          <form onSubmit={handleDispatch} className="space-y-4 font-sans">
            {/* Target Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient Audience *
                </label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="all">Entire Registry (All Active Members)</option>
                  <option value="category">Specific Membership Category</option>
                  <option value="multiple">Selected Members (Multiple Selection)</option>
                  <option value="individual">Single Individual Member</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Urgency / Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="normal">Standard Announcement</option>
                  <option value="high">High Importance</option>
                  <option value="urgent">Urgent Notice</option>
                </select>
              </div>
            </div>

            {/* Conditional Target: Category */}
            {targetType === 'category' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Category
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Rank #{c.rank})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Conditional Target: Single Individual */}
            {targetType === 'individual' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Member
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.user?.name || m.profile?.full_name} ({m.member_number})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Conditional Target: Multiple Members Selection */}
            {targetType === 'multiple' && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800">
                      Select Multiple Recipients ({selectedMemberIds.length} selected)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Check members below who should receive this message.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        const filtered = members.filter((m) => {
                          const q = memberSearchQuery.toLowerCase();
                          const name = (m.user?.name || m.profile?.full_name || '').toLowerCase();
                          const email = (m.user?.email || '').toLowerCase();
                          const num = (m.member_number || '').toLowerCase();
                          return name.includes(q) || email.includes(q) || num.includes(q);
                        });
                        setSelectedMemberIds(filtered.map((m) => m.id));
                      }}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Select All Filtered
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedMemberIds([])}
                      className="text-[11px] font-semibold text-slate-600 hover:text-slate-800"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Filter members by name, member number, or email..."
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />

                <div className="max-h-48 overflow-y-auto space-y-1 bg-white border border-slate-200 rounded-xl p-2">
                  {members
                    .filter((m) => {
                      const q = memberSearchQuery.toLowerCase();
                      const name = (m.user?.name || m.profile?.full_name || '').toLowerCase();
                      const email = (m.user?.email || '').toLowerCase();
                      const num = (m.member_number || '').toLowerCase();
                      return name.includes(q) || email.includes(q) || num.includes(q);
                    })
                    .map((m) => {
                      const isChecked = selectedMemberIds.includes(m.id);
                      return (
                        <label
                          key={m.id}
                          className={`flex items-center space-x-2.5 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                            isChecked ? 'bg-blue-50/80 font-medium' : 'hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedMemberIds((prev) =>
                                prev.includes(m.id) ? prev.filter((id) => id !== m.id) : [...prev, m.id]
                              );
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                          />
                          <div className="flex-1 flex items-center justify-between">
                            <span className="text-slate-900">
                              {m.user?.name || m.profile?.full_name || 'Member'}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {m.member_number}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Outbound Sender Email Account (Type 2 Engine) */}
            <div className="p-3.5 bg-slate-50/90 border border-slate-200/90 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-800 flex items-center space-x-1.5">
                  <Server className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Outbound Sending Mailer (Engine Type 2)</span>
                </label>
                <Link
                  to="/admin/sending-accounts"
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center"
                >
                  Manage Senders <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
              </div>

              {sendingAccounts.length > 0 ? (
                <select
                  value={selectedSendingAccountId}
                  onChange={(e) => setSelectedSendingAccountId(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-medium"
                >
                  {sendingAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} — {acc.from_name} &lt;{acc.from_email}&gt; {acc.is_default ? '★ (Default)' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  No dedicated sending accounts found. System general notification relay will be used.
                </p>
              )}

              <label className="inline-flex items-center space-x-2 pt-0.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendOutboundEmail}
                  onChange={(e) => setSendOutboundEmail(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-medium text-slate-700">
                  Dispatch email notifications directly to member personal email inboxes
                </span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Announcement Subject *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Annual General Assembly & Strategic Update"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Message Body *
              </label>
              <textarea
                rows={6}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Compose the full body of the announcement..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" size="md" isLoading={isSending}>
                <Send className="w-4 h-4 mr-2" />
                Dispatch Broadcast
              </Button>
            </div>
          </form>
        </div>

        {/* Recipient Preview Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Users className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Audience Telemetry</h2>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Resolved Recipient Target</span>
                <div className="text-2xl font-bold text-slate-900">
                  {previewCount === null ? '—' : `${previewCount} Members`}
                </div>
              </div>
              <Badge variant="neutral">
                {targetType.toUpperCase()}
              </Badge>
            </div>

            {sampleRecipients.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500">Sample Target Recipients:</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {sampleRecipients.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <span className="font-semibold text-slate-800">{rec.name}</span>
                      <span className="font-mono text-slate-400 text-[11px]">{rec.member_number}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Info Box */}
          <div className="p-5 bg-blue-50/60 border border-blue-100 rounded-2xl text-xs text-blue-900 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-blue-950">
              <Mail className="w-4 h-4 text-blue-600" />
              Multi-Channel Dispatch
            </div>
            <p className="leading-relaxed text-blue-800">
              Broadcasts are automatically synchronized with both the in-portal member inbox and dispatched via the SMTP relay service to each verified member's email address.
            </p>
          </div>
        </div>
      </div>

      {/* Message Dispatch History */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-600" />
          Broadcast History
        </h2>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Loading broadcast archive...
          </div>
        ) : messages.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No broadcast communiqués dispatched yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Sender Mailer</th>
                  <th className="py-3 px-4">Audience</th>
                  <th className="py-3 px-4">Dispatched At</th>
                  <th className="py-3 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {messages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {msg.subject}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          msg.priority === 'urgent'
                            ? 'danger'
                            : msg.priority === 'high'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {msg.priority.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {msg.sending_account?.name || 'General Gateway'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {msg.target_type === 'all'
                        ? 'All Members'
                        : msg.target_type === 'category'
                        ? 'Category Specific'
                        : 'Individual Member'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(msg.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setViewingMessage(msg)}
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600 mr-1" />
                        <span>Inspect</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Message Inspection Modal */}
      {viewingMessage && (
        <Modal
          isOpen={true}
          onClose={() => setViewingMessage(null)}
          title={viewingMessage.subject}
          description={`Dispatched: ${new Date(viewingMessage.created_at).toLocaleString()}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Priority</span>
                <span className="font-semibold text-slate-800 uppercase">{viewingMessage.priority}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Audience</span>
                <span className="font-semibold text-slate-800 capitalize">{viewingMessage.target_type}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Sender Profile</span>
                <span className="font-semibold text-indigo-700 truncate block text-[11px]" title={viewingMessage.sending_account?.name || 'General Relay'}>
                  {viewingMessage.sending_account?.name || 'General Relay'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Message Content</span>
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                {viewingMessage.body}
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setViewingMessage(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
