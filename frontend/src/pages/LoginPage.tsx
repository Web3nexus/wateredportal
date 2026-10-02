import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { AlertCircle, ArrowLeft, Shield } from 'lucide-react';

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
      setError(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const setPreset = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('password');
    setError(null);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#eae7df] rounded-[4px] p-8 shadow-[0_2px_4px_rgba(24,24,27,0.04),0_12px_28px_-6px_rgba(24,24,27,0.08)]">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-[2px] bg-[#faf8f4] border border-[#d8c7a6] items-center justify-center text-[#966922] font-serif font-bold text-base mb-3 shadow-2xs">
            MW
          </div>
          <h2 className="font-serif text-xl font-semibold tracking-wider text-stone-900">
            CHAMBER SIGN IN
          </h2>
          <p className="text-xs text-stone-500 font-sans mt-1">
            Enter your sovereign credentials to enter the private register
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-[2px] text-xs text-rose-800 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Council Registered Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="member@mywater.com"
            autoComplete="email"
          />

          <Input
            label="Security Passkey"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <div className="pt-2">
            <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
              Sign In to Chamber
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-[#eae7df]">
          <span className="block text-[10px] uppercase font-sans font-semibold text-stone-400 tracking-wider text-center mb-3">
            Quick Demonstration Credentials
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setPreset('admin@mywater.com')}
              className="p-2 bg-[#fbf9f5] hover:bg-[#f6f3eb] border border-[#eae3d5] rounded-[2px] text-left transition-colors cursor-pointer"
            >
              <div className="font-serif font-medium text-stone-900">High Council Admin</div>
              <div className="text-[10px] text-stone-500 font-mono">admin@mywater.com</div>
            </button>
            <button
              type="button"
              onClick={() => setPreset('member@mywater.com')}
              className="p-2 bg-[#fbf9f5] hover:bg-[#f6f3eb] border border-[#eae3d5] rounded-[2px] text-left transition-colors cursor-pointer"
            >
              <div className="font-serif font-medium text-stone-900">Active Member</div>
              <div className="text-[10px] text-stone-500 font-mono">member@mywater.com</div>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/join"
            className="text-xs text-stone-600 hover:text-stone-900 font-sans transition-colors"
          >
            Not yet registered? <span className="text-[#966922] font-medium underline">Petition for admission &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
