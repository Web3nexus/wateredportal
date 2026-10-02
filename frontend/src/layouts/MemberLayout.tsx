import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  CreditCard,
  User as UserIcon,
  Mail,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';

export const MemberLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Digital Pass', to: '/card', icon: CreditCard },
    { label: 'Messages', to: '/messages', icon: Mail },
    { label: 'Profile', to: '/profile', icon: UserIcon },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Brand Logo */}
            <div className="flex items-center space-x-6">
              <NavLink to="/dashboard" className="flex items-center space-x-3 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 flex items-center justify-center text-white font-bold text-base shadow-sm ring-1 ring-white/10 group-hover:scale-105 transition-transform">
                  W
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-bold tracking-tight text-slate-900">
                      Watered
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      Portal
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    Member Network
                  </span>
                </div>
              </NavLink>

              <a
                href="http://mywatered.com/"
                target="_blank"
                rel="noreferrer"
                className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors px-2.5 py-1 rounded-md hover:bg-slate-100/70"
                title="Visit main website"
              >
                <span>mywatered.com</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* User Profile & Actions */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900">
                  {user?.name || 'Member'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {user?.member?.member_number || user?.email}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 text-xs font-medium transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg">
            <div className="pb-2 mb-2 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-900">{user?.name || 'Member'}</p>
              <p className="text-[11px] text-slate-500">{user?.email}</p>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <a
                href="http://mywatered.com/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 text-xs text-indigo-600"
              >
                <span>mywatered.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-xs text-rose-600 font-medium py-1 px-2 rounded hover:bg-rose-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-800">Watered</span>
            <span>&bull;</span>
            <span>Member Identity & Access Management</span>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="http://mywatered.com/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-600 transition-colors"
            >
              mywatered.com
            </a>
            <span>&bull;</span>
            <span className="text-slate-400">Secure Sanctum Authentication</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
