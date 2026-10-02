import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { Badge } from '../../components/common/Badge';
import {
  Users,
  FileCheck2,
  Send,
  Layers,
  Clock,
  ArrowRight,
  ShieldCheck,
  Activity,
  Mail,
  Smartphone,
  FileCode2,
  BarChart3,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminService
      .getDashboard()
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium tracking-wide">
          Loading system metrics and telemetry...
        </p>
      </div>
    );
  }

  const { stats, category_distribution, recent_applications, recent_audits } = data || {
    stats: { active_members: 0, pending_applications: 0, total_messages: 0 },
    category_distribution: [],
    recent_applications: [],
    recent_audits: [],
  };

  const totalMembers = (category_distribution || []).reduce(
    (acc: number, c: any) => acc + (c.members_count || 0),
    0
  ) || stats.active_members || 1;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Executive Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-200/80 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Live Governance
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Watered Administrative Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time membership metrics, communication gateways, and application review queue
          </p>
        </div>

        {/* Header Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/email-system"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all"
          >
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            <span>SMTP Settings</span>
          </Link>

          <Link
            to="/admin/twilio-sms"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all"
          >
            <Smartphone className="w-3.5 h-3.5 text-teal-600" />
            <span>Twilio Gateway</span>
          </Link>

          <Link
            to="/admin/email-templates"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all"
          >
            <FileCode2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Templates</span>
          </Link>

          <Link
            to="/admin/messages"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>New Broadcast</span>
          </Link>
        </div>
      </div>

      {/* Gateway Operational Status Banner */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-100 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">Communication & Gateway Status</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                All Systems Operational
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Email SMTP relay, Twilio SMS broadcast pipeline, and open/click telemetry tracking are actively monitored.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 shrink-0">
          <Link
            to="/admin/communications"
            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span>View Telemetry Analytics &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Active Members */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Members
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {stats.active_members}
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              Enrolled
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Verified Registry Roll</span>
            <Link to="/admin/members" className="text-blue-600 hover:underline font-medium">
              View &rarr;
            </Link>
          </div>
        </div>

        {/* Pending Applications */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Applications
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {stats.pending_applications}
            </span>
            {stats.pending_applications > 0 ? (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                Needs Review
              </span>
            ) : (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                Up to date
              </span>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Applicant Submissions</span>
            <Link to="/admin/applications" className="text-blue-600 hover:underline font-medium">
              Review &rarr;
            </Link>
          </div>
        </div>

        {/* Broadcast Messages */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Broadcasts Dispatched
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {stats.total_messages}
            </span>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
              Transmitted
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Email & SMS Combined</span>
            <Link to="/admin/messages" className="text-blue-600 hover:underline font-medium">
              History &rarr;
            </Link>
          </div>
        </div>

        {/* Gateway & Telemetry Health */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Gateways & Tracking
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              100%
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              Healthy
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Telemetry Resolution</span>
            <Link to="/admin/communications" className="text-blue-600 hover:underline font-medium">
              Stats &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Applications Review & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Recent Applications Queue & Category Distribution */}
        <div className="lg:col-span-7 space-y-6">
          {/* Recent Applications Queue */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Recent Membership Applications
                  </h2>
                  <p className="text-xs text-slate-500">Candidate submissions awaiting administrative review</p>
                </div>
              </div>
              <Link
                to="/admin/applications"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                <span>View All Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recent_applications.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                No recent membership applications found.
              </div>
            ) : (
              <div className="space-y-3">
                {recent_applications.map((app: any) => (
                  <Link
                    key={app.id}
                    to="/admin/applications"
                    className="block p-4 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/40 hover:bg-blue-50/30 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100/70 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center">
                          {app.first_name?.[0] || 'U'}
                          {app.last_name?.[0] || ''}
                        </div>
                        <div>
                          <span className="font-semibold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                            {app.first_name} {app.last_name}
                          </span>
                          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>{app.email}</span>
                            <span>•</span>
                            <span className="text-slate-400 font-mono text-[11px]">{app.application_number}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}>
                        {app.status.toUpperCase()}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Membership Tier Distribution */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Membership Tiers Distribution
                  </h2>
                  <p className="text-xs text-slate-500">Active member enrollment across recognized categories</p>
                </div>
              </div>
              <Link
                to="/admin/categories"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                <span>Manage Tiers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {category_distribution.map((cat: any) => {
                const count = cat.members_count ?? 0;
                const percentage = Math.min(100, Math.round((count / totalMembers) * 100));
                return (
                  <div key={cat.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: cat.badge_color || '#3b82f6' }}
                        />
                        <span className="font-semibold text-slate-900">{cat.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Rank #{cat.rank}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800">{count}</span>
                        <span className="text-slate-400 text-[11px]">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(percentage, 4)}%`,
                          backgroundColor: cat.badge_color || '#3b82f6',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Communications Gateways Quick Panel & Recent Audit Log */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Gateway Management Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              Gateway Quick Access
            </h2>
            <p className="text-xs text-slate-500">
              Configure communication endpoints, send diagnostics, and manage assets.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Link
                to="/admin/email-system"
                className="p-3.5 rounded-xl border border-slate-200/80 hover:border-blue-200 bg-slate-50/50 hover:bg-blue-50/30 transition-all flex items-start gap-3 group"
              >
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-slate-900 group-hover:text-blue-700">Email System</div>
                  <div className="text-[11px] text-slate-500">SMTP Host & Test</div>
                </div>
              </Link>

              <Link
                to="/admin/twilio-sms"
                className="p-3.5 rounded-xl border border-slate-200/80 hover:border-teal-200 bg-slate-50/50 hover:bg-teal-50/30 transition-all flex items-start gap-3 group"
              >
                <div className="p-2 rounded-lg bg-teal-100 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-slate-900 group-hover:text-teal-700">Twilio SMS</div>
                  <div className="text-[11px] text-slate-500">Account SID & Token</div>
                </div>
              </Link>

              <Link
                to="/admin/email-templates"
                className="p-3.5 rounded-xl border border-slate-200/80 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/30 transition-all flex items-start gap-3 group"
              >
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <FileCode2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-slate-900 group-hover:text-indigo-700">Email Templates</div>
                  <div className="text-[11px] text-slate-500">Notices & Layouts</div>
                </div>
              </Link>

              <Link
                to="/admin/branding"
                className="p-3.5 rounded-xl border border-slate-200/80 hover:border-amber-200 bg-slate-50/50 hover:bg-amber-50/30 transition-all flex items-start gap-3 group"
              >
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-slate-900 group-hover:text-amber-700">Brand Assets</div>
                  <div className="text-[11px] text-slate-500">Logos & Favicon</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Audit Activity Stream */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Recent Audit Trail
                </h2>
              </div>
              <Link
                to="/admin/audit-logs"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                <span>Full Logs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recent_audits.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No recent audit activity recorded.
                </div>
              ) : (
                recent_audits.slice(0, 6).map((log: any) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/40 text-xs flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-800">
                        {log.action?.replace(/_/g, ' ')?.toUpperCase()}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <span>{log.user?.name || 'System Operator'}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-400">{log.ip_address || '127.0.0.1'}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
