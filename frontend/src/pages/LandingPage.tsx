import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicService } from '../services/publicService';
import { MembershipCategory } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  CreditCard,
  Bell,
  Lock,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Users,
  Search,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [categories, setCategories] = useState<MembershipCategory[]>([]);
  const [verifyInput, setVerifyInput] = useState('');

  useEffect(() => {
    publicService
      .getCategories()
      .then((res) => setCategories(res.categories))
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  return (
    <div className="space-y-24 py-12 sm:py-20">
      {/* 1. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Official Member Network &bull; Identity & Access</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Digital Membership & <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-600 bg-clip-text text-transparent">
                Pass Verification
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Instant contactless credential verification, exclusive community announcements, and verified digital identity for the Watered global network.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm shadow-md shadow-slate-900/10 transition-all hover:scale-[1.02]"
              >
                <span>Member Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/join"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-semibold text-xs sm:text-sm shadow-xs transition-all hover:border-slate-300"
              >
                <span>Apply for Membership</span>
              </Link>
            </div>

            {/* Parent Organization Link */}
            <div className="pt-4 flex items-center justify-center lg:justify-start space-x-3 text-xs text-slate-500">
              <span>Affiliated with</span>
              <a
                href="http://mywatered.com/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-indigo-600 hover:underline flex items-center space-x-1"
              >
                <span>mywatered.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Right Column: Hero Visual - Titanium Digital Pass Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[420px]">
              {/* Decorative Ambient Aura */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 via-cyan-500/10 to-purple-500/20 rounded-3xl blur-2xl pointer-events-none" />

              {/* The Titanium Card */}
              <div className="relative aspect-[1.586/1] rounded-2xl p-6 sm:p-7 shadow-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-slate-700/60 overflow-hidden select-none">
                {/* Glow Effects */}
                <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
                <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

                {/* Card Top */}
                <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                      W
                    </div>
                    <div>
                      <span className="font-bold text-sm text-white block">Watered</span>
                      <span className="text-[9px] uppercase tracking-wider text-indigo-300 font-semibold block">
                        Official Member Pass
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold tracking-wide px-2.5 py-0.5 rounded-full border border-indigo-400/40 bg-indigo-500/20 text-indigo-200">
                    Standard Tier
                  </span>
                </div>

                {/* Card Body */}
                <div className="relative z-10 grid grid-cols-12 gap-3 mt-4 items-center">
                  <div className="col-span-4 flex flex-col items-center">
                    <div className="w-20 h-24 rounded-xl overflow-hidden border border-white/20 shadow-md bg-slate-800 p-0.5 relative">
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
                        alt="Kofi Mensah"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full border border-slate-900" />
                    </div>
                  </div>

                  <div className="col-span-8 pl-1">
                    <span className="text-[8px] text-slate-400 uppercase tracking-widest font-semibold block">
                      Member Name
                    </span>
                    <h3 className="font-bold text-base text-white truncate">Kofi Mensah</h3>

                    <div className="grid grid-cols-2 gap-2 mt-2 text-[10px]">
                      <div>
                        <span className="text-[8px] text-slate-400 uppercase tracking-widest block">
                          Member ID
                        </span>
                        <span className="font-mono text-indigo-200 font-semibold text-[11px]">
                          MW-000123
                        </span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-400 uppercase tracking-widest block">
                          Status
                        </span>
                        <span className="text-emerald-300 font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                          <span>Active</span>
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="text-[9px] text-slate-400 font-mono">LIVE SCANNABLE</span>
                      <div className="bg-white p-1 rounded shadow-xs">
                        <QRCodeSVG value="https://mywatered.com/verify/demo" size={26} level="M" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                  <span>SECURE TOKEN: 9A8B7C6D</span>
                  <span className="text-indigo-300 font-sans font-semibold">mywatered.com</span>
                </div>
              </div>

              {/* Floating Verified Badge */}
              <div className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-xl px-4 py-2.5 shadow-lg flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Instant Verification</span>
                  <span className="text-[10px] text-slate-500">Tamper-proof digital token</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Highlights (3 Pillars) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Platform Capabilities
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Engineered for Verified Membership
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Everything members need to verify identity, stay updated, and control access permissions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Verified Digital Pass</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Every member receives an anti-tamper scannable pass with a unique QR token. Display on any mobile screen for contactless check-in at official gatherings.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Priority Announcements</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Direct communiqués from leadership delivered straight to your member inbox, paired with optional Twilio SMS alerts and email announcements.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Autonomous Privacy Controls</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Full control over your visibility. Choose whether your pass verification is public or private, configure SMS notifications, and update login credentials at any time.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Membership Tiers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-3 mb-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Membership Classifications
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Recognized Membership Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Watered membership tiers represent active participation, stewardship roles, and professional contributions across the network.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.length > 0 ? (
              categories.map((cat, idx) => (
                <div
                  key={cat.id || idx}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xs hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/20"
                      style={{
                        color: cat.badge_color || '#38bdf8',
                        borderColor: cat.badge_color ? `${cat.badge_color}55` : undefined,
                      }}
                    >
                      Tier {idx + 1}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {cat.code}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white mb-1">{cat.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {cat.description || 'Active membership tier in the Watered network.'}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-slate-400 text-xs">
                Loading membership categories...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Pass Quick Verification Box */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Verify a Member Pass</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Event hosts and facility partners can verify any member pass instantly using the unique QR reference token.
          </p>

          <div className="max-w-md mx-auto flex items-center gap-2 pt-2">
            <input
              type="text"
              value={verifyInput}
              onChange={(e) => setVerifyInput(e.target.value)}
              placeholder="Enter secure token (e.g. sec_mw_...)"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden font-mono"
            />
            <Link
              to={verifyInput.trim() ? `/verify/${encodeURIComponent(verifyInput.trim())}` : '/verify'}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shrink-0"
            >
              Verify
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Bottom Join Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold">Ready to Join Watered?</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
              Submit your membership application online to receive your verified digital pass and access portal resources.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/join"
              className="px-6 py-3.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02]"
            >
              Apply for Membership
            </Link>
            <Link
              to="/login"
              className="px-6 py-3.5 rounded-xl border border-white/20 text-white hover:bg-white/10 font-bold text-xs sm:text-sm transition-all"
            >
              Member Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
