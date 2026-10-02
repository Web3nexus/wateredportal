import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { memberService } from '../../services/memberService';
import { CardData, MessageRecipient } from '../../types';
import { DigitalCard } from '../../components/card/DigitalCard';
import { Modal } from '../../components/common/Modal';
import {
  CreditCard,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Bell,
  Clock,
  Settings,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [card, setCard] = useState<CardData | null>(null);
  const [recentMessages, setRecentMessages] = useState<MessageRecipient[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<MessageRecipient | null>(null);

  useEffect(() => {
    Promise.all([
      memberService.getCard().then((res) => setCard(res.card)),
      memberService.getMessages('all', 1).then((res) => {
        setRecentMessages(res.messages.data.slice(0, 4));
        setUnreadCount(res.unread_count);
      }),
    ])
      .catch((err) => {
        console.error('Failed to load member dashboard data', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleCopyMemberId = (idStr: string) => {
    navigator.clipboard.writeText(idStr);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading member portal...</p>
      </div>
    );
  }

  const memberName = card?.full_name || user?.name || 'Member';
  const categoryName = card?.category?.name || 'Watered';
  const memberNumber = card?.member_number || user?.member?.member_number || '---';

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              Active Member Standing
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500 font-medium">{categoryName} Tier</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {memberName}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Access your verified member pass, view organization communiqués, and manage your profile details.
          </p>
        </div>

        {/* Member ID Quick Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between min-w-[200px]">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Member ID
            </span>
            <span className="font-mono text-base font-bold text-slate-900 tracking-wide">
              {memberNumber}
            </span>
          </div>

          <button
            onClick={() => handleCopyMemberId(memberNumber)}
            className="mt-3 inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
          >
            {copiedId ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Member ID</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Pass Status
            </span>
            <span className="text-sm font-bold text-slate-900">Verified & Active</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              QR Access
            </span>
            <span className="text-sm font-bold text-slate-900">Live Scannable</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Inbox
            </span>
            <span className="text-sm font-bold text-slate-900">
              {unreadCount > 0 ? `${unreadCount} Unread` : 'All Caught Up'}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Membership
            </span>
            <span className="text-sm font-bold text-slate-900 truncate block max-w-[120px]">
              {categoryName}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Digital Pass Showcase & Recent Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Digital Pass Showcase */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">Your Digital Pass</h2>
              </div>
              <Link
                to="/card"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
              >
                <span>Full Pass View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {card ? (
              <>
                <DigitalCard card={card} showActions={true} />
                <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1.5 text-xs text-slate-600">
                  <span className="font-semibold text-slate-900 block">Check-in Instructions:</span>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    Display this scannable QR pass at the entrance of authorized Watered gatherings or affiliated facilities for instant credentials verification.
                  </p>
                </div>
              </>
            ) : (
              <div className="py-10 px-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-slate-900">
                    {user?.role === 'admin' ? 'Administrator Account' : 'No Digital Pass Assigned'}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    {user?.role === 'admin'
                      ? 'You are signed in as an administrator. Member credentials are only assigned to active member accounts.'
                      : 'Your membership application is currently being processed. Your pass will appear here once approved.'}
                  </p>
                </div>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
                  >
                    <span>Go to Admin Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Communications & Quick Actions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Announcements Feed */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">Recent Announcements</h2>
              </div>
              <Link
                to="/messages"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
              >
                <span>View All Messages</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentMessages.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <Mail className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-medium">No recent announcements or notifications.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4 cursor-pointer group hover:bg-slate-50/80 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        {!msg.read_at && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                        )}
                        <h4 className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {msg.message?.subject || 'Member Notice'}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {msg.message?.body || ''}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1 text-[11px] text-slate-400 shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>
                        {msg.message?.created_at
                          ? new Date(msg.message.created_at).toLocaleDateString()
                          : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/profile"
              className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Member Profile
                  </h3>
                  <span className="text-[11px] text-slate-500">View and edit personal details</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Update your contact info, occupation, and profile photo.
              </p>
            </Link>

            <Link
              to="/settings"
              className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Security & Notifications
                  </h3>
                  <span className="text-[11px] text-slate-500">Password and alert settings</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Manage your login credentials, SMS alerts, and privacy.
              </p>
            </Link>
          </div>

          {/* Parent Organization Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">
                Parent Organization
              </span>
              <h3 className="text-base font-bold text-white">Watered Main Portal</h3>
              <p className="text-xs text-slate-300 max-w-md">
                Visit the official Watered website for general community news, events, and public initiatives.
              </p>
            </div>

            <a
              href="http://mywatered.com/"
              target="_blank"
              rel="noreferrer"
              className="shrink-0 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <span>mywatered.com</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Message Reader Modal */}
      <Modal
        isOpen={!!selectedMessage}
        onClose={() => setSelectedMessage(null)}
        title={selectedMessage?.message?.subject || 'Announcement'}
      >
        {selectedMessage && (
          <div className="space-y-4 p-2">
            <div className="text-xs text-slate-400 flex items-center space-x-2 pb-2 border-b border-slate-100">
              <span>Date:</span>
              <span className="font-medium text-slate-600">
                {selectedMessage.message?.created_at
                  ? new Date(selectedMessage.message.created_at).toLocaleString()
                  : 'N/A'}
              </span>
            </div>

            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line py-2">
              {selectedMessage.message?.body}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
