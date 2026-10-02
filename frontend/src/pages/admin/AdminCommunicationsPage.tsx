import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Smartphone,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Search,
  RefreshCw,
  ExternalLink,
  Info,
} from 'lucide-react';
import { communicationsService } from '../../services/communicationsService';
import type { CommunicationsStats, EmailLog, SmsLog } from '../../types';

export const AdminCommunicationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'emails' | 'sms' | 'registrations'>('emails');
  const [stats, setStats] = useState<CommunicationsStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Email Logs State
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [emailStatusFilter, setEmailStatusFilter] = useState<string>('all');
  const [emailSearch, setEmailSearch] = useState<string>('');
  const [emailPage, setEmailPage] = useState<number>(1);
  const [emailTotal, setEmailTotal] = useState<number>(0);
  const [emailLoading, setEmailLoading] = useState<boolean>(false);

  // SMS Logs State
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  const [smsStatusFilter, setSmsStatusFilter] = useState<string>('all');
  const [smsSearch, setSmsSearch] = useState<string>('');
  const [smsPage, setSmsPage] = useState<number>(1);
  const [smsTotal, setSmsTotal] = useState<number>(0);
  const [smsLoading, setSmsLoading] = useState<boolean>(false);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await communicationsService.getStats();
      setStats(res);
    } catch (e) {
      console.error(e);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchEmails = async () => {
    try {
      setEmailLoading(true);
      const res = await communicationsService.getEmailLogs({
        status: emailStatusFilter,
        q: emailSearch,
        page: emailPage,
        per_page: 12,
      });
      setEmails(res.data || []);
      setEmailTotal(res.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setEmailLoading(false);
    }
  };

  const fetchSms = async () => {
    try {
      setSmsLoading(true);
      const res = await communicationsService.getSmsLogs({
        status: smsStatusFilter,
        q: smsSearch,
        page: smsPage,
        per_page: 12,
      });
      setSmsLogs(res.data || []);
      setSmsTotal(res.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setSmsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'emails') {
      fetchEmails();
    } else if (activeTab === 'sms') {
      fetchSms();
    }
  }, [activeTab, emailStatusFilter, emailPage, smsStatusFilter, smsPage]);

  const handleEmailSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailPage(1);
    fetchEmails();
  };

  const handleSmsSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSmsPage(1);
    fetchSms();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-200/80 gap-4">
        <div>
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
            Communications Analytics
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Telemetry & Tracking Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time delivery status, email open rate telemetry, Twilio SMS logs, and registration pipeline analytics
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              fetchStats();
              if (activeTab === 'emails') fetchEmails();
              if (activeTab === 'sms') fetchSms();
            }}
            className="p-2.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition shadow-xs cursor-pointer"
            title="Refresh statistics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/admin/email-system"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-500/20 transition"
          >
            Configure Gateways
          </Link>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Emails & Open Rate */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Total Emails</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-slate-900">
              {stats?.email.total_sent ?? 0}
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {stats?.email.open_rate ?? 0}% Opened
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-blue-600 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, stats?.email.open_rate ?? 0)}%` }}
            />
          </div>
        </div>

        {/* Card 2: Opened vs Unopened Emails */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Email Reads</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="text-xs text-slate-500 font-medium">Opened</p>
              <p className="text-2xl font-bold text-emerald-700">
                {stats?.email.opened ?? 0}
              </p>
            </div>
            <div className="h-8 border-r border-slate-200" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Unopened</p>
              <p className="text-2xl font-bold text-slate-600">
                {stats?.email.unopened ?? 0}
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: SMS Tracking */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">SMS Transmissions</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-slate-900">
              {stats?.sms.total_sent ?? 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({stats?.sms.delivered ?? 0} delivered)
            </span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span className="font-medium text-emerald-700">Twilio Gateway Active</span>
          </div>
        </div>

        {/* Card 4: Registrations Funnel */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Registrations</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-slate-900">
              {stats?.registrations.total ?? 0}
            </span>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
              {stats?.registrations.conversion_rate ?? 0}% Admitted
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5">
            <span>{stats?.registrations.approved ?? 0} Approved</span>
            <span>{stats?.registrations.pending ?? 0} Pending</span>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-slate-200 space-x-4 sm:space-x-8">
        <button
          onClick={() => setActiveTab('emails')}
          className={`pb-3.5 text-xs sm:text-sm font-semibold flex items-center space-x-2 border-b-2 transition cursor-pointer ${
            activeTab === 'emails'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Email Telemetry ({stats?.email.total_sent ?? 0})</span>
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
          <span>Twilio SMS Gateway ({stats?.sms.total_sent ?? 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('registrations')}
          className={`pb-3.5 text-xs sm:text-sm font-semibold flex items-center space-x-2 border-b-2 transition cursor-pointer ${
            activeTab === 'registrations'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Registration Conversion Funnel</span>
        </button>
      </div>

      {/* TAB 1: EMAIL TRACKING */}
      {activeTab === 'emails' && (
        <div className="space-y-4">
          {/* Tracking Pixel Info Box */}
          <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-start space-x-3 text-xs text-blue-900">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-blue-950">Active Open Telemetry:</span> Outbound emails include an invisible 1×1 tracking beacon pointing to <code className="font-mono bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded">/api/track/email/:token.png</code>. When client email readers download images, the system automatically registers the read event, open count, and exact timestamp.
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 border border-slate-200/90 rounded-2xl shadow-sm">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setEmailStatusFilter('all');
                  setEmailPage(1);
                }}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                  emailStatusFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Emails
              </button>
              <button
                onClick={() => {
                  setEmailStatusFilter('opened');
                  setEmailPage(1);
                }}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                  emailStatusFilter === 'opened'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Opened ({stats?.email.opened ?? 0})
              </button>
              <button
                onClick={() => {
                  setEmailStatusFilter('unopened');
                  setEmailPage(1);
                }}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                  emailStatusFilter === 'unopened'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Unopened ({stats?.email.unopened ?? 0})
              </button>
            </div>

            <form onSubmit={handleEmailSearchSubmit} className="relative sm:w-72">
              <input
                type="text"
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                placeholder="Search email, recipient, subject..."
                className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </form>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
            {emailLoading ? (
              <div className="py-16 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                <span>Loading email logs...</span>
              </div>
            ) : emails.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                No email tracking logs found matching this filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                      <th className="py-3.5 px-4">Recipient</th>
                      <th className="py-3.5 px-4">Subject</th>
                      <th className="py-3.5 px-4">Tracking Status</th>
                      <th className="py-3.5 px-4">Opens</th>
                      <th className="py-3.5 px-4">Dispatched</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {emails.map((email) => {
                      const isOpened = email.status === 'opened' || (email.opens_count && email.opens_count > 0);
                      return (
                        <tr key={email.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">{email.recipient_name || 'Member'}</div>
                            <div className="text-slate-500 font-mono text-[11px]">{email.recipient_email}</div>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-800">
                            {email.subject}
                          </td>
                          <td className="py-3.5 px-4">
                            {isOpened ? (
                              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Opened</span>
                                {email.opened_at && (
                                  <span className="text-[10px] text-emerald-600 ml-1">
                                    ({new Date(email.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                  </span>
                                )}
                              </span>
                            ) : email.status === 'failed' ? (
                              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-semibold">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Failed</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>Unopened</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                            {email.opens_count ?? 0}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                            {new Date(email.created_at).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SMS TRACKING */}
      {activeTab === 'sms' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 border border-slate-200/90 rounded-2xl shadow-sm">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setSmsStatusFilter('all');
                  setSmsPage(1);
                }}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                  smsStatusFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All SMS
              </button>
              <button
                onClick={() => {
                  setSmsStatusFilter('delivered');
                  setSmsPage(1);
                }}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                  smsStatusFilter === 'delivered'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Delivered
              </button>
            </div>

            <form onSubmit={handleSmsSearchSubmit} className="relative sm:w-72">
              <input
                type="text"
                value={smsSearch}
                onChange={(e) => setSmsSearch(e.target.value)}
                placeholder="Search phone number or message..."
                className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </form>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
            {smsLoading ? (
              <div className="py-16 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                <span>Loading SMS logs...</span>
              </div>
            ) : smsLogs.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                No SMS telemetry records found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                      <th className="py-3.5 px-4">Recipient Phone</th>
                      <th className="py-3.5 px-4">Message Body</th>
                      <th className="py-3.5 px-4">Gateway</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Dispatched</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {smsLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                          {log.recipient_phone}
                          {log.recipient_name && (
                            <div className="text-[11px] font-sans text-slate-500 font-normal">
                              {log.recipient_name}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 max-w-sm truncate">
                          {log.message_body}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 uppercase">
                          {log.gateway}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span className="capitalize">{log.status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                          {new Date(log.created_at).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: REGISTRATION FUNNEL */}
      {activeTab === 'registrations' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Registration Pipeline Conversion
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live funnel overview from incoming applications to verified register admission.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                1. Applications Submitted
              </span>
              <p className="text-3xl font-bold text-slate-900">
                {stats?.registrations.total ?? 0}
              </p>
              <p className="text-xs text-slate-500">
                Total candidates received into portal
              </p>
            </div>

            <div className="p-6 bg-amber-50/70 border border-amber-200 rounded-2xl text-center space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                2. Pending Review
              </span>
              <p className="text-3xl font-bold text-amber-900">
                {stats?.registrations.pending ?? 0}
              </p>
              <p className="text-xs text-amber-700">
                Awaiting administrator review
              </p>
            </div>

            <div className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                3. Admitted Members
              </span>
              <p className="text-3xl font-bold text-emerald-900">
                {stats?.registrations.approved ?? 0}
              </p>
              <p className="text-xs text-emerald-700">
                {stats?.registrations.conversion_rate ?? 0}% overall admission rate
              </p>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Link
              to="/admin/applications"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-500/20 transition"
            >
              <span>Review Incoming Applications</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
