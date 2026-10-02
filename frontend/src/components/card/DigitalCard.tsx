import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CardData } from '../../types';
import { ShieldCheck, Maximize2, CheckCircle2, Copy, Check, ExternalLink } from 'lucide-react';
import { Modal } from '../common/Modal';

interface DigitalCardProps {
  card: CardData;
  showActions?: boolean;
}

export const DigitalCard: React.FC<DigitalCardProps> = ({ card, showActions = true }) => {
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const verificationUrl = `${window.location.origin}/verify/${card.secure_qr_id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Executive Digital Pass */}
      <div className="relative w-full max-w-[430px] aspect-[1.586/1] rounded-2xl p-6 sm:p-7 shadow-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white overflow-hidden select-none border border-slate-700/60 transition-transform duration-300 hover:scale-[1.01]">
        {/* Ambient Glow & Card Design Lines */}
        <div className="absolute -right-16 -top-16 w-52 h-52 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-52 h-52 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-5 pointer-events-none" />

        {/* Card Header */}
        <div className="relative z-10 flex items-center justify-between pb-3.5 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-bold text-sm shadow-inner">
              W
            </div>
            <div>
              <span className="font-bold text-sm tracking-wide text-white block">
                Watered
              </span>
              <span className="text-[10px] tracking-wider text-indigo-300/90 uppercase font-semibold block">
                Official Member Pass
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <span
              className="text-[10px] font-semibold tracking-wide px-2.5 py-0.5 rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm"
              style={{
                borderColor: card.category?.badge_color ? `${card.category.badge_color}55` : undefined,
                color: card.category?.badge_color || '#ffffff',
              }}
            >
              {card.category?.name || 'Standard'}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="relative z-10 grid grid-cols-12 gap-4 mt-4 items-center">
          {/* Member Photo */}
          <div className="col-span-4 flex flex-col items-center">
            <div className="relative w-20 h-24 sm:w-22 sm:h-26 rounded-xl overflow-hidden border border-white/20 shadow-md bg-slate-800 p-0.5">
              {card.photograph_url ? (
                <img
                  src={card.photograph_url}
                  alt={card.full_name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800/80 text-slate-400">
                  <ShieldCheck className="w-7 h-7 text-indigo-400 mb-1" />
                  <span className="text-[9px] uppercase tracking-wider font-semibold">Active</span>
                </div>
              )}
              {card.status === 'active' && (
                <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900 shadow-sm" />
              )}
            </div>
          </div>

          {/* Member Details */}
          <div className="col-span-8 flex flex-col justify-between pl-1">
            <div>
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold block">
                Member Name
              </span>
              <h3 className="font-semibold text-base sm:text-lg text-white tracking-tight leading-tight truncate">
                {card.full_name}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
              <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold block">
                  Member ID
                </span>
                <span className="font-mono font-medium text-indigo-200 tracking-wider text-xs">
                  {card.member_number}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold block">
                  Valid Thru
                </span>
                <span className="font-medium text-slate-300 text-xs">
                  {card.valid_until || 'Permanent'}
                </span>
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center space-x-1.5 text-[10px] text-emerald-300 font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Verified Standing</span>
              </div>

              <div
                className="cursor-pointer bg-white p-1 rounded-md shadow hover:opacity-90 transition-opacity"
                onClick={() => setShowQrModal(true)}
                title="Click to enlarge QR"
              >
                <QRCodeSVG value={verificationUrl} size={30} level="M" />
              </div>
            </div>
          </div>
        </div>

        {/* Card Bottom Bar */}
        <div className="relative z-10 mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>SECURE REF: {card.secure_qr_id.slice(0, 10).toUpperCase()}</span>
          <span className="text-indigo-300 font-sans font-semibold">mywatered.com</span>
        </div>
      </div>

      {/* Action Controls */}
      {showActions && (
        <div className="w-full max-w-[430px] mt-4 flex items-center justify-between gap-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Enlarge QR</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Pass Link</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Modal for QR Check-in Scan */}
      <Modal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        title="Digital Check-in QR Code"
      >
        <div className="flex flex-col items-center text-center p-4 space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-md">
            <QRCodeSVG value={verificationUrl} size={220} level="H" includeMargin={true} />
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">{card.full_name}</h4>
            <p className="font-mono text-xs text-indigo-600 font-semibold">{card.member_number}</p>
            <p className="text-xs text-slate-500 max-w-xs pt-1">
              Present this code at check-in stations or events for instant access verification.
            </p>
          </div>

          <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Status: Active</span>
            <a
              href={verificationUrl}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:underline flex items-center space-x-1"
            >
              <span>Verification page</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
};
