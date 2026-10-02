import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { NotificationBell } from '../components/common/NotificationBell';
import {
  LayoutDashboard,
  FileCheck2,
  Users,
  Layers,
  Send,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Mail,
  Smartphone,
  FileCode2,
  BarChart3,
  Palette,
  Settings,
  Activity,
  Globe,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/securegate');
  };

  const navSections = [
    {
      title: 'Registry & Members',
      items: [
        { label: 'Overview Dashboard', to: '/admin', end: true, icon: LayoutDashboard },
        { label: 'Membership Applications', to: '/admin/applications', icon: FileCheck2 },
        { label: 'Member Directory', to: '/admin/members', icon: Users },
        { label: 'Membership Categories', to: '/admin/categories', icon: Layers },
      ],
    },
    {
      title: 'Communications & Gateways',
      items: [
        { label: 'Email System (SMTP)', to: '/admin/email-system', icon: Mail },
        { label: 'Twilio SMS Gateway', to: '/admin/twilio-sms', icon: Smartphone },
        { label: 'Email Templates', to: '/admin/email-templates', icon: FileCode2 },
        { label: 'Tracking & Telemetry', to: '/admin/communications', icon: BarChart3 },
        { label: 'Broadcast Messages', to: '/admin/messages', icon: Send },
      ],
    },
    {
      title: 'System & Branding',
      items: [
        { label: 'Branding & Assets', to: '/admin/branding', icon: Palette },
        { label: 'Security & Audit Trail', to: '/admin/audit-logs', icon: ShieldCheck },
        { label: 'System Settings', to: '/admin/settings', icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50/70 text-slate-900 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-72 bg-white border-r border-slate-200/90 shadow-sm z-30 shrink-0">
        {/* Brand Header */}
        <div className="h-18 px-6 flex items-center justify-between border-b border-slate-100 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-center p-1.5 shadow-xs">
              <img src="/logo.png" alt="Watered" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-slate-900">
                  Watered
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                  ADMIN
                </span>
              </div>
              <span className="block text-[11px] font-medium text-slate-500">
                Portal Management Console
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="px-3.5 py-5 flex-1 overflow-y-auto space-y-6">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-blue-50/90 text-blue-700 font-semibold shadow-xs border border-blue-100'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/90'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0 transition-colors" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Quick Gateway Health Pill & Profile Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
          {/* Quick Gateway Status */}
          <div className="px-3 py-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                Live Gateways
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Operational
              </span>
            </div>
            <div className="text-[10px] text-slate-500 flex justify-between font-mono">
              <span>SMTP: Active</span>
              <span>Twilio: Ready</span>
            </div>
          </div>

          {/* Links to Member View & Parent Site */}
          <div className="space-y-1">
            <NavLink
              to="/dashboard"
              className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
            >
              <span className="flex items-center space-x-2">
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                <span>Switch to Member View</span>
              </span>
            </NavLink>
            <a
              href="http://mywatered.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
            >
              <span className="flex items-center space-x-2">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Parent Site (mywatered.com)</span>
              </span>
            </a>
          </div>

          {/* User Session & Logout */}
          <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between px-2">
            <div className="overflow-hidden pr-2">
              <span className="block text-xs font-semibold text-slate-900 truncate">
                {user?.name || 'Administrator'}
              </span>
              <span className="block text-[11px] text-slate-500 truncate">
                {user?.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out of Admin Console"
              className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Portal</span>
              <span className="text-slate-300">/</span>
              <span className="text-sm font-semibold text-slate-800">Watered Administration</span>
            </div>
          </div>

          {/* Top Bar Actions */}
          <div className="flex items-center space-x-3">
            {/* Quick Live Telemetry Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-full text-xs font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gateways Online</span>
            </div>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Switch to Member Portal */}
            <NavLink
              to="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Member Portal</span>
            </NavLink>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors"
              title="Sign out of Secure Gate"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setIsSidebarOpen(false)}
            />
            <div className="relative w-72 bg-white border-r border-slate-200 flex flex-col p-5 z-10 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/90 flex items-center justify-center p-1 shadow-xs">
                    <img src="/logo.png" alt="Watered" className="w-full h-full object-contain" />
                  </div>
                  <span className="font-bold text-sm text-slate-900">
                    Watered Admin
                  </span>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1.5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-5 flex-1 overflow-y-auto">
                {navSections.map((section) => (
                  <div key={section.title} className="space-y-1">
                    <div className="px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {section.title}
                    </div>
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.end}
                          onClick={() => setIsSidebarOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                              isActive
                                ? 'bg-blue-50 text-blue-700 font-semibold'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`
                          }
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
