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
  Shield,
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
        message: 'The submitted identifier does not correspond to an active MYWATER credential.',
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
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#eae7df] rounded-[4px] p-6 sm:p-8 shadow-[0_2px_4px_rgba(24,24,27,0.04),0_12px_28px_-6px_rgba(24,24,27,0.08)] text-center">
        {/* Seal Insignia */}
        <div className="inline-flex w-12 h-12 rounded-[2px] bg-[#faf8f4] border border-[#d8c7a6] items-center justify-center text-[#966922] font-serif font-bold text-base mb-3 shadow-2xs">
          MW
        </div>

        <h1 className="font-serif text-xl font-semibold tracking-wider text-stone-900 uppercase">
          CREDENTIAL VERIFICATION
        </h1>

        <p className="text-xs text-stone-500 font-sans mt-1 mb-6">
          Sovereign Public Registry Verification Gateway
        </p>

        {!secureId && (
          <form onSubmit={handleSubmit} className="mb-6 space-y-3">
            <Input
              placeholder="Paste or enter credential token..."
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" size="md" className="w-full" isLoading={isLoading}>
              <Search className="w-3.5 h-3.5 mr-2" />
              Verify Identifier
            </Button>
          </form>
        )}

        {isLoading && (
          <div className="py-8 space-y-3">
            <div className="w-8 h-8 border-2 border-[#966922] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-stone-500 tracking-wider">
              CONSULTING SOVEREIGN ROLL...
            </p>
          </div>
        )}

        {!isLoading && result && result.verified && result.member && (
          <div className="mt-4 p-5 bg-[#faf8f4] border border-[#eae3d5] rounded-[3px] space-y-4 text-left shadow-2xs">
            <div className="flex items-center space-x-2 text-emerald-800 border-b border-[#eae3d5] pb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <span className="block text-xs font-serif font-semibold tracking-wide uppercase">
                  CREDENTIAL VALIDATED
                </span>
                <span className="text-[10px] text-emerald-700 font-mono">
                  Official Roll Attestation Confirmed
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-20 h-24 rounded-[2px] border border-[#dcd4c3] overflow-hidden bg-white shrink-0 shadow-2xs p-0.5">
                {result.member.photograph_url ? (
                  <img
                    src={result.member.photograph_url}
                    alt={result.member.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                    Portrait
                  </div>
                )}
              </div>

              <div className="space-y-1 overflow-hidden">
                <span className="text-[9px] uppercase tracking-wider text-stone-400 font-sans font-medium block">
                  Credential Bearer
                </span>
                <h3 className="font-serif text-base font-semibold text-stone-900 tracking-normal truncate">
                  {result.member.full_name}
                </h3>

                <div className="pt-1">
                  <span className="text-[9px] uppercase tracking-wider text-stone-400 font-sans font-medium block">
                    Membership Court
                  </span>
                  <span className="inline-block text-xs font-serif font-medium tracking-wide border border-[#d8c7a6] px-2 py-0.5 rounded-[2px] mt-0.5 bg-white text-[#8a5d1b]">
                    {result.member.category_name}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#eae3d5] text-xs">
              <div>
                <span className="text-[10px] uppercase text-stone-400 block font-sans">Member ID</span>
                <span className="font-mono font-medium text-[#8a5d1b] text-sm tracking-wider">
                  {result.member.member_number}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-stone-400 block font-sans">Status</span>
                <Badge variant={result.member.status === 'active' ? 'success' : 'neutral'}>
                  {result.member.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="pt-2 border-t border-[#eae3d5] text-[10px] text-stone-400 flex items-center justify-between font-mono">
              <span>VALIDATED AT:</span>
              <span>{new Date(result.member.verified_at).toLocaleTimeString()}</span>
            </div>
          </div>
        )}

        {!isLoading && result && !result.verified && hasSearched && (
          <div className="mt-4 p-5 bg-rose-50 border border-rose-200 rounded-[3px] space-y-2 text-left">
            <div className="flex items-center space-x-2 text-rose-800">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600" />
              <span className="text-xs font-semibold font-serif tracking-wider uppercase">
                CREDENTIAL INVALID OR REVOKED
              </span>
            </div>
            <p className="text-xs text-rose-700 leading-relaxed font-sans">
              {result.message ||
                'This security token does not correspond to an active accredited member in the MYWATER roll.'}
            </p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-[#eae7df] text-[10px] text-stone-400 leading-relaxed text-center flex items-center justify-center space-x-1.5 font-sans">
          <Lock className="w-3.5 h-3.5 text-[#966922] shrink-0" />
          <span>Private contact records are cryptographically sealed and omitted from public verification.</span>
        </div>

        <div className="mt-4">
          <Link to="/" className="text-xs text-stone-500 hover:text-stone-800 inline-flex items-center font-sans">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Return to Portal Entrance
          </Link>
        </div>
      </div>
    </div>
  );
};
