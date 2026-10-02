import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ExternalLink, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-10 text-slate-500 text-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="Watered"
              className="w-8 h-8 object-contain"
            />
            <div>
              <span className="font-bold text-slate-900 block text-sm">
                Watered
              </span>
              <span className="text-[11px] text-slate-400">
                Official Membership Identity & Registry
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
            <Link to="/verify" className="hover:text-indigo-600 transition-colors font-medium">
              Verify Pass
            </Link>
            <Link to="/join" className="hover:text-indigo-600 transition-colors font-medium">
              Membership Application
            </Link>
            <a
              href="http://mywatered.com/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-600 transition-colors font-medium flex items-center space-x-1"
            >
              <span>mywatered.com</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <Link
              to="/securegate"
              className="text-slate-400 hover:text-slate-600 transition-colors flex items-center space-x-1 font-mono text-[11px]"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Gate</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>&copy; {new Date().getFullYear()} Watered. All rights reserved.</p>
          <div className="flex items-center space-x-2">
            <span>Secure Sanctum Verification</span>
            <span>&bull;</span>
            <span>Encrypted Token Infrastructure</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
