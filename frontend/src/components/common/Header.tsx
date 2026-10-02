import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ShieldCheck, LogOut, LayoutDashboard, ExternalLink, Menu, X, Shield } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-3 group">
            <img
              src="/logo.png"
              alt="Watered"
              className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
            />
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
          </Link>

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

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-3 sm:space-x-4">
          <Link
            to="/verify"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors px-3 py-2 rounded-lg hover:bg-slate-100/70"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Verify Pass</span>
          </Link>

          {user ? (
            <div className="flex items-center space-x-3">
              {isAdmin ? (
                <Link
                  to="/admin"
                  className="inline-flex items-center space-x-1.5 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2 rounded-lg font-semibold transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center space-x-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800 px-3.5 py-2 rounded-lg font-semibold transition-colors shadow-xs"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Member Dashboard</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                title="Sign out of portal"
                className="flex items-center space-x-1 text-xs text-slate-500 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50/50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2.5">
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/join"
                className="text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors shadow-xs"
              >
                Apply for Membership
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 shadow-lg">
          <Link
            to="/verify"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 text-xs font-semibold text-slate-700 py-2 px-3 rounded-lg hover:bg-slate-100"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Verify Pass</span>
          </Link>

          <a
            href="http://mywatered.com/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between text-xs font-semibold text-slate-600 py-2 px-3 rounded-lg hover:bg-slate-100"
          >
            <span>Visit mywatered.com</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            {user ? (
              <>
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 w-full text-xs font-semibold bg-slate-900 text-white py-2 px-3 rounded-lg"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{isAdmin ? 'Admin Portal' : 'Member Dashboard'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full text-xs font-semibold text-rose-600 py-2 px-3 rounded-lg hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-xs font-semibold text-slate-700 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/join"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-xs font-semibold bg-slate-900 text-white py-2 rounded-lg"
                >
                  Apply for Membership
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
