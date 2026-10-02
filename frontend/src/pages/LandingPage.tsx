import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, KeyRound, UserPlus, ArrowRight, Shield, Award, Users } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const courts = [
    { name: 'Watered', role: 'Sovereign Pinnacle Tier', desc: 'Presiding council of executive stewardship and ultimate constitutional governance.' },
    { name: "Leopard's Court", role: 'Lineage Custody', desc: 'Guardians of ancestral history, oral testimony, and sacred lineage records.' },
    { name: 'Chokwe Initiates', role: 'Sacred Arts & Craft', desc: 'Scholars dedicated to structural design, craftsmanship, and geometric arts.' },
    { name: 'Kemetic Court', role: 'Cosmic Order & Law', desc: 'Chamber adjudicating harmony, moral ordinances, and constitutional standards.' },
    { name: 'Auset Court', role: 'Matriarchal Council', desc: 'Stewards of family welfare, regenerative initiatives, and fellowship.' },
    { name: "The Reminder's Court", role: 'Historical Chronicle', desc: 'Scribes recording all official convocations, memorials, and ceremonial milestones.' },
    { name: 'Hudorian Guard', role: 'Sanctuary Protection', desc: 'Discreet protective roll upholding chamber safety, protocol, and peace.' },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24 text-center">
      {/* Insignia */}
      <div className="mb-6">
        <div className="w-14 h-14 rounded-[3px] bg-[#faf8f4] border border-[#d8c7a6] flex items-center justify-center text-[#966922] font-serif font-bold text-xl shadow-xs mx-auto">
          MW
        </div>
      </div>

      {/* Main Title */}
      <h1 className="font-serif text-3xl sm:text-5xl font-semibold tracking-wider text-stone-900 leading-tight">
        MYWATER
      </h1>

      <p className="mt-2 text-xs sm:text-sm tracking-widest uppercase text-[#966922] font-sans font-medium">
        Sovereign Membership Roll & Chamber
      </p>

      <p className="mt-5 max-w-lg text-stone-600 text-sm sm:text-base leading-relaxed font-sans">
        The official institutional register, cryptographic credential verification, and sovereign communications channel for the fellowship of MYWATER.
      </p>

      {/* Primary Actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md">
        <Link
          to="/login"
          className="w-full sm:w-auto flex-1 inline-flex items-center justify-center space-x-2 bg-[#18181b] hover:bg-[#27272a] text-white font-medium text-xs tracking-wider px-6 py-3 rounded-[3px] shadow-xs transition-colors"
        >
          <KeyRound className="w-4 h-4 text-stone-300" />
          <span>Council Sign In</span>
        </Link>

        <Link
          to="/join"
          className="w-full sm:w-auto flex-1 inline-flex items-center justify-center space-x-2 bg-white hover:bg-[#f6f5f1] text-stone-900 border border-[#dcd7cb] font-medium text-xs tracking-wider px-6 py-3 rounded-[3px] shadow-2xs transition-colors"
        >
          <UserPlus className="w-4 h-4 text-[#966922]" />
          <span>Petition for Admission</span>
        </Link>
      </div>

      {/* Public Verification Link */}
      <div className="mt-8 pt-6 border-t border-[#eae7df] max-w-md w-full">
        <Link
          to="/verify"
          className="inline-flex items-center space-x-2 text-xs text-stone-600 hover:text-stone-900 transition-colors py-1.5 px-3 rounded-[2px] hover:bg-[#f6f5f1]"
        >
          <ShieldCheck className="w-4 h-4 text-[#966922]" />
          <span>Verify Credential by QR Hash</span>
          <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
        </Link>
      </div>

      {/* Courts of the Roll Grid */}
      <div className="mt-16 max-w-5xl w-full text-left">
        <div className="flex items-center justify-between pb-3 mb-6 border-b border-[#eae7df]">
          <div>
            <h2 className="font-serif text-lg font-medium text-stone-900">
              The Seven Courts of the Order
            </h2>
            <p className="text-xs text-stone-500 font-sans mt-0.5">
              Constitutional hierarchy and stewardship classifications of the membership roll.
            </p>
          </div>
          <Award className="w-5 h-5 text-[#966922]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courts.map((court, idx) => (
            <div
              key={court.name}
              className="bg-white border border-[#eae7df] rounded-[4px] p-4 shadow-2xs hover:border-[#d8c7a6] transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-[#966922] uppercase tracking-wider">
                  Tier 0{idx + 1}
                </span>
                <span className="text-[10px] text-stone-400 font-sans uppercase">
                  {court.role}
                </span>
              </div>
              <h3 className="font-serif text-base font-semibold text-stone-900 mb-1">
                {court.name}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                {court.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 flex items-center space-x-2 text-[11px] text-stone-400 font-sans">
        <Lock className="w-3 h-3 text-[#966922]" />
        <span>AUTHENTICATED ACCESS ONLY &bull; CRYPTOGRAPHICALLY AUDITED REGISTRY</span>
      </div>
    </div>
  );
};
