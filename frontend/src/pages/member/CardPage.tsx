import React, { useEffect, useState } from 'react';
import { memberService } from '../../services/memberService';
import { CardData } from '../../types';
import { DigitalCard } from '../../components/card/DigitalCard';
import { Smartphone, ShieldCheck, Printer, CheckCircle2 } from 'lucide-react';

export const CardPage: React.FC = () => {
  const [card, setCard] = useState<CardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    memberService
      .getCard()
      .then((res) => setCard(res.card))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading digital pass...</p>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="py-16 text-center text-slate-500 text-xs">
        No active digital pass found for this member account.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-1 pb-4 border-b border-slate-200">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 block">
          Digital Credential
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Official Member Pass
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Your official digital pass for access verification, event check-in, and member standing.
        </p>
      </div>

      {/* Card Presentation */}
      <div className="py-2">
        <DigitalCard card={card} showActions={true} />
      </div>

      {/* Verification Instructions Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 text-xs text-slate-600 space-y-4 max-w-xl mx-auto shadow-xs">
        <div className="flex items-center space-x-2.5 text-slate-900 font-bold text-sm">
          <Smartphone className="w-4 h-4 text-indigo-600" />
          <span>Mobile Check-in Guidelines</span>
        </div>

        <p className="leading-relaxed text-slate-500 text-xs">
          When attending Watered events or accessing member spaces, present this digital QR code on your mobile device. Security and reception staff will scan the code to instantly verify your active membership.
        </p>

        <div className="grid grid-cols-2 gap-3 pt-2 text-[11px]">
          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1">
            <span className="font-semibold text-slate-800 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Real-time Status</span>
            </span>
            <p className="text-slate-500 text-[10px]">
              Card reflects live status from the secure central registry.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1">
            <span className="font-semibold text-slate-800 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>Anti-Tamper QR</span>
            </span>
            <p className="text-slate-500 text-[10px]">
              Cryptographically signed token prevents duplication.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <span>TOKEN: {card.secure_qr_id.slice(0, 14).toUpperCase()}</span>
          <button
            onClick={() => window.print()}
            className="font-sans text-slate-600 hover:text-indigo-600 font-semibold flex items-center space-x-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Pass</span>
          </button>
        </div>
      </div>
    </div>
  );
};
