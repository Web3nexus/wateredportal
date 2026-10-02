import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-[#eae7df] bg-[#f7f6f2] py-8 text-stone-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-3.5 h-3.5 text-[#966922]" />
          <span className="font-serif tracking-wider text-stone-700 font-medium">
            MYWATER &bull; SOVEREIGN MEMBERSHIP ROLL
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-stone-500">
          <Link to="/verify" className="hover:text-stone-900 transition-colors">
            Public Registry Verification
          </Link>
          <span className="text-stone-300">&bull;</span>
          <span>Cryptographic Seals &bull; Council Custody</span>
          <span className="text-stone-300">&bull;</span>
          <span>&copy; {new Date().getFullYear()} MYWATER Council. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};
