import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const loggedUser = await login({ email, password });
      if (from) {
        navigate(from, { replace: true });
      } else if (loggedUser.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-slate-50/60 min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-8 shadow-xl shadow-slate-200/50">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 items-center justify-center text-white font-bold text-lg mb-3 shadow-sm ring-1 ring-white/10">
            W
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Member Sign In
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enter your registered credentials to access your Watered account
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="member@mywater.com"
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

          <div className="pt-2">
            <Button type="submit" variant="primary" size="lg" className="w-full justify-center shadow-xs" isLoading={isLoading}>
              Sign In to Portal
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Not a member yet?</span>
          <Link
            to="/join"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
          >
            Apply for membership <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="mt-3 text-center">
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
