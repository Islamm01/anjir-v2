// app/page.tsx
"use client";

import Link from "next/link";
import { ShoppingBag, Package, Clock, ChevronRight, MapPin,
         Zap, Timer, Banknote, ShieldCheck, Tag, Headphones } from "lucide-react";
import { useLang }     from "@/components/providers/LangProvider";
import LangSwitcher    from "@/components/ui/LangSwitcher";
import { t, l }        from "@/lib/i18n";
import SupportButton from "@/components/shared/SupportButton";

export default function HomePage() {
  const { lang } = useLang();

  const trustItems = [
    { icon: Zap,         text: l(t.home.trust_1, lang) },
    { icon: Timer,       text: l(t.home.trust_2, lang) },
    { icon: Banknote,    text: l(t.home.trust_3, lang) },
    { icon: ShieldCheck, text: l(t.home.trust_4, lang) },
    { icon: Tag,         text: l(t.home.trust_5, lang) },
    { icon: Headphones,  text: l(t.home.trust_6, lang) },
  ];

  return (
    <div className="min-h-screen bg-[#f7f5f0]">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="bg-[#1a472a] text-white">
        <div className="max-w-md mx-auto px-5 pt-12 pb-6">

          {/* Top row: logo + lang switcher */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center font-black text-[18px]">
                A
              </div>
              <div>
                <span className="text-[20px] font-black tracking-tight leading-none block">anjir</span>
                <span className="text-[10px] text-white/50 leading-none">Расонидан</span>
              </div>
            </div>

            {/* Language switcher — always visible in header */}
            <div className="flex items-center gap-3">
              <LangSwitcher variant="light" />
              <Link href="/auth"
                className="px-3.5 py-1.5 bg-white/15 rounded-full text-[12px] font-semibold hover:bg-white/25 transition-colors">
                {l(t.nav.login, lang)}
              </Link>
            </div>
          </div>

          {/* City */}
          <div className="flex items-center gap-2 text-[13px] text-white/60">
            <MapPin size={14} className="text-white/40" />
            <span>{l(t.home.city, lang)}</span>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-5 py-6">

        {/* ── Hero text ──────────────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-[26px] font-black text-black tracking-tight leading-tight mb-1 whitespace-pre-line">
            {l(t.home.question, lang)}
          </h1>
          <p className="text-[14px] text-black/45">{l(t.home.subtitle, lang)}</p>
        </div>

        {/* ── Service cards ──────────────────────────────────────────────── */}
        <div className="space-y-3 mb-8">

          {/* Service 1: Marketplace */}
          <Link href="/marketplace" className="block group">
            <div className="bg-white rounded-3xl overflow-hidden border border-black/5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
              <div className="bg-[#1a472a] px-6 pt-6 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white/80 mb-3">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                      {l(t.home.open, lang)}
                    </div>
                    <h2 className="text-[20px] font-black text-white leading-tight whitespace-pre-line">
                      {l(t.home.s1_title, lang)}
                    </h2>
                  </div>
                  <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mt-1">
                    <ShoppingBag size={26} className="text-white" />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4">
                <p className="text-[13px] text-black/50 mb-3">{l(t.home.s1_desc, lang)}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[12px] text-black/40">
                    <div className="flex items-center gap-1"><Clock size={12} /><span>{l(t.home.s1_time, lang)}</span></div>
                    <span>{l(t.home.s1_fee, lang)}</span>
                  </div>
                  <div className="w-8 h-8 bg-[#1a472a] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ChevronRight size={16} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Service 2: Courier delivery */}
          <Link href="/courier-service" className="block group">
            <div className="bg-white rounded-3xl overflow-hidden border border-black/5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
              <div className="bg-[#854F0B] px-6 pt-6 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white/80 mb-3">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                      {l(t.home.round, lang)}
                    </div>
                    <h2 className="text-[20px] font-black text-white leading-tight whitespace-pre-line">
                      {l(t.home.s2_title, lang)}
                    </h2>
                  </div>
                  <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mt-1">
                    <Package size={26} className="text-white" />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4">
                <p className="text-[13px] text-black/50 mb-3">{l(t.home.s2_desc, lang)}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[12px] text-black/40">
                    <div className="flex items-center gap-1"><Clock size={12} /><span>{l(t.home.s2_time, lang)}</span></div>
                    <span>{l(t.home.s2_fee, lang)}</span>
                  </div>
                  <div className="w-8 h-8 bg-[#854F0B] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ChevronRight size={16} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* ── Trust section ──────────────────────────────────────────────── */}
        <div className="mb-8">
          <h2 className="text-[18px] font-black text-black mb-4">
            {l(t.home.trust_title, lang)}
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {trustItems.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 bg-white rounded-2xl px-4 py-3 border border-black/5">
                <div className="w-8 h-8 bg-[#1a472a]/8 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-[#1a472a]" />
                </div>
                <p className="text-[12px] font-semibold text-black leading-tight">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Role links ─────────────────────────────────────────────────── */}
        <div className="pt-5 border-t border-black/8 flex flex-wrap gap-2 justify-center">
          {[
            { href: "/store",   label: l(t.home.i_am_store,   lang) },
            { href: "/courier", label: l(t.home.i_am_courier, lang) },
            { href: "/admin",   label: l(t.home.operator,     lang) },
          ].map(link => (
            <Link key={link.href} href={link.href}
              className="text-[12px] text-black/35 hover:text-black transition-colors px-3 py-1.5 border border-black/10 rounded-full hover:border-black/25">
              {link.label}
            </Link>
          ))}
        </div>

      </div>
      <SupportButton />
    </div>
  );
}