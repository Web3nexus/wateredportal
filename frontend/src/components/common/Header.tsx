import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ShieldCheck, LogOut, LayoutDashboard, UserCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#eae7df]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-8 h-8 rounded-[2px] bg-[#faf8f4] border border-[#d8c7a6] flex items-center justify-center text-[#966922] font-serif font-bold text-sm tracking-widest shadow-2xs group-hover:border-[#966922] transition-colors">
            MW
          </div>
          <div>
            <span className="font-serif text-base sm:text-lg font-semibold tracking-wider text-stone-900 group-hover:text-[#966922] transition-colors">
              MYWATER
            </span>
            <span className="block text-[10px] tracking-widest text-[#966922] uppercase font-sans font-medium">
              Sovereign Council
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-3 sm:space-x-5">
          <Link
            to="/verify"
            className="inline-flex items-center space-x-1.5 text-xs text-stone-600 hover:text-stone-900 transition-colors px-2.5 py-1.5 rounded-[2px] hover:bg-[#f6f5f1]"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#966922]" />
            <span>Verify Credential</span>
          </Link>

          {user ? (
            <div className="flex items-center space-x-2.5">
              {isAdmin ? (
                <Link
                  to="/admin"
                  className="inline-flex items-center space-x-1.5 text-xs bg-[#faf6ed] text-[#8a5d1b] hover:bg-[#f5ecda] border border-[#e2d5bd] px-3 py-1.5 rounded-[2px] font-medium transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Admin Chamber</span>
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center space-x-1.5 text-xs bg-white text-stone-800 hover:bg-[#f6f5f1] border border-[#dcd7cb] px-3 py-1.5 rounded-[2px] font-medium transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Member Chamber</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                title="Sign out of portal"
                className="text-stone-400 hover:text-rose-600 p-1.5 rounded-[2px] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="text-xs tracking-wide text-stone-700 hover:text-stone-900 px-3 py-1.5 rounded-[2px] transition-colors font-medium hover:bg-[#f6f5f1]"
              >
                Sign In
              </Link>
              <Link
                to="/join"
                className="text-xs tracking-wide bg-[#18181b] text-white hover:bg-[#27272a] font-medium px-3.5 py-1.5 rounded-[2px] transition-colors shadow-2xs"
              >
                Petition for Admission
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
