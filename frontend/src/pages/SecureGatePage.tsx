import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { AlertCircle, ShieldCheck, KeyRound, ArrowRight, ExternalLink } from 'lucide-react';

export const SecureGatePage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { secureGateLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const loggedUser = await secureGateLogin({ email, password, passcode });
      if (loggedUser.role === 'admin') {
        navigate(from || '/admin', { replace: true });
      } else {
        setError('Access denied. This gate is strictly reserved for administrative accounts.');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify administrator credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-20 bg-slate-50/60 min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-9 shadow-xl shadow-slate-200/50 relative overflow-hidden">
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500" />

        <div className="text-center mb-8 pt-2">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-white border border-slate-200/80 items-center justify-center p-2 mb-3 shadow-sm ring-1 ring-slate-100">
            <img src="/logo.png" alt="Watered" className="w-full h-full object-contain" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 bg-blue-50/80 border border-blue-200/60 rounded-full text-[11px] font-semibold tracking-wide text-blue-700">
            Secure Gate &bull; Admin Access
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Watered Admin Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Restricted authentication gate for portal administrators
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Administrator Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@mywatered.com"
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Gate Passkey <span className="text-slate-400 font-normal">(Optional Passcode)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="WG-2026-ADMIN"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" size="lg" className="w-full justify-center shadow-md shadow-blue-500/10" isLoading={isLoading}>
              Sign In to Admin Console
            </Button>
          </div>
        </form>

        {/* Footnotes */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Standard Member?</span>
          <Link
            to="/login"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Member Sign In <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="mt-4 text-center">
          <a
            href="http://mywatered.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
          >
            Visit parent organization <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
};
