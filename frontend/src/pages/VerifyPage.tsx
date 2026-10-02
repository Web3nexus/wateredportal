import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicService } from '../services/publicService';
import { PublicVerificationResult } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  Lock,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

export const VerifyPage: React.FC = () => {
  const { secureId } = useParams<{ secureId?: string }>();
  const [inputToken, setInputToken] = useState(secureId || '');
  const [result, setResult] = useState<PublicVerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performVerification = async (token: string) => {
    if (!token.trim()) return;
    setIsLoading(true);
    setHasSearched(true);

    try {
      const data = await publicService.verifyCredential(token.trim());
      setResult(data);
    } catch {
      setResult({
        verified: false,
        message: 'The submitted identifier does not correspond to an active Watered credential.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (secureId) {
      performVerification(secureId);
    }
  }, [secureId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(inputToken);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16 bg-slate-50/60 min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 text-center relative overflow-hidden">
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-900 via-indigo-600 to-indigo-800" />

        <div className="text-center mb-6 pt-2">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-white border border-slate-200/80 items-center justify-center p-2 mb-3 shadow-sm ring-1 ring-slate-100">
            <img src="/logo.png" alt="Watered" className="w-full h-full object-contain" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pass Verification
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official Watered digital pass and credential verification
          </p>
        </div>

        {!secureId && (
          <form onSubmit={handleSubmit} className="mb-6 space-y-3">
            <Input
              placeholder="Paste or enter credential token..."
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" size="md" className="w-full justify-center" isLoading={isLoading}>
              <Search className="w-3.5 h-3.5 mr-2" />
              Verify Pass
            </Button>
          </form>
        )}

        {isLoading && (
          <div className="py-8 space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-slate-500 tracking-wider">
              VERIFYING CREDENTIAL...
            </p>
          </div>
        )}

        {!isLoading && result && result.verified && result.member && (
          <div className="mt-4 p-5 bg-slate-50/80 border border-slate-200/90 rounded-xl space-y-4 text-left shadow-xs">
            <div className="flex items-center space-x-2 text-emerald-800 border-b border-slate-200/80 pb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="block text-xs font-bold tracking-wide text-slate-900 uppercase">
                  CREDENTIAL VALIDATED
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">
                  Active member in official register
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-20 h-24 rounded-xl border border-slate-200 overflow-hidden bg-white shrink-0 shadow-xs p-0.5">
                {result.member.photograph_url ? (
                  <img
                    src={result.member.photograph_url}
                    alt={result.member.full_name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                    Portrait
                  </div>
                )}
              </div>

              <div className="space-y-1 overflow-hidden">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-medium block">
                  Member Name
                </span>
                <h3 className="text-base font-bold text-slate-900 tracking-tight truncate">
                  {result.member.full_name}
                </h3>

                <div className="pt-1">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-medium block">
                    Membership Tier
                  </span>
                  <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mt-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700">
                    {result.member.category_name}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/80 text-xs">
              <div>
                <span className="text-[10px] uppercase text-slate-400 block font-medium">Member ID</span>
                <span className="font-mono font-bold text-slate-900 text-sm tracking-wider">
                  {result.member.member_number}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 block font-medium">Status</span>
                <Badge variant={result.member.status === 'active' ? 'success' : 'neutral'}>
                  {result.member.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 text-[10px] text-slate-400 flex items-center justify-between font-mono">
              <span>VALIDATED AT:</span>
              <span>{new Date(result.member.verified_at).toLocaleTimeString()}</span>
            </div>
          </div>
        )}

        {!isLoading && result && !result.verified && hasSearched && (
          <div className="mt-4 p-5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-left">
            <div className="flex items-center space-x-2 text-rose-800">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600" />
              <span className="text-xs font-bold tracking-wider uppercase">
                CREDENTIAL INVALID OR REVOKED
              </span>
            </div>
            <p className="text-xs text-rose-700 leading-relaxed">
              {result.message ||
                'This security token does not correspond to an active member in the Watered registry.'}
            </p>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed text-center flex items-center justify-center space-x-1.5">
          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Private member records are cryptographically protected and omitted from public display.</span>
        </div>

        <div className="mt-4">
          <Link to="/login" className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center font-medium">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
