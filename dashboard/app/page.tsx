'use client';

import Link from 'next/link';
import {
  Sparkles,
  QrCode,
  Gift,
  Building2,
  Store,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Zap,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { LoyaltyCardVisual } from '@/components/loyalty/LoyaltyCardVisual';
import { LoyaltyCard } from '@/types';

export default function HomePage() {
  // Demo interactive card for landing preview
  const demoCard: LoyaltyCard = {
    id: 'demo-card',
    user_id: 'demo-user',
    program_id: 'demo-prog',
    company_id: 'demo-comp',
    current_stamps: 4,
    lifetime_stamps: 10,
    rewards_earned: 1,
    rewards_redeemed: 1,
    status: 'active',
    last_visit_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    company: {
      id: 'demo-comp',
      owner_id: 'demo-owner',
      name: 'Artisan Roast & Café',
      slug: 'artisan-roast',
      description: 'Specialty coffee roastery and organic bakery',
      logo_url: null,
      banner_url: null,
      primary_color: '#18181b',
      category: 'Artisan Café & Bakery',
      address: '124 Market Street',
      phone: '+1 (555) 019-2834',
      website: 'https://example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    program: {
      id: 'demo-prog',
      company_id: 'demo-comp',
      title: 'Artisan Coffee Club',
      description: 'Buy 6 coffees or beverages, get your 7th handcrafted drink free!',
      target_stamps: 6,
      reward_title: '1 Free Handcrafted Beverage',
      reward_description: 'Valid for any size drip, cappuccino, latte, or cold brew.',
      card_bg_color: '#09090b',
      card_accent_color: '#71717a',
      stamp_icon: 'coffee',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline and Pitch */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200 shadow-sm font-mono">
                <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
                <span>Minimal Digital Loyalty Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-950 tracking-tight leading-[1.1]">
                Replace Lost Paper Punch Cards with{' '}
                <span className="text-zinc-950 underline decoration-zinc-400 decoration-2 underline-offset-8">
                  Instant QR Passes
                </span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 max-w-2xl leading-relaxed">
                Empower your business with digital stamp cards. Customers earn stamps with a fast QR scan at checkout, unlock rewards automatically, and keep coming back.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/register?role=company"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-sm shadow-sm transition"
                >
                  <Building2 className="w-4 h-4" />
                  Launch Company Program
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  href="/register?role=user"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-200 font-semibold text-sm shadow-sm transition"
                >
                  <CreditCard className="w-4 h-4 text-zinc-800" />
                  Get Customer Pass
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-zinc-200 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-zinc-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-zinc-800" /> No physical hardware needed
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-zinc-800" /> Fraud-proof QR verification
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-zinc-800" /> Instant 1-second counter stamp
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Card Preview */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-sm">
                <div className="text-center mb-3">
                  <span className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-700 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200">
                    Live Digital Pass Preview
                  </span>
                </div>
                <LoyaltyCardVisual
                  card={demoCard}
                  showActions={false}
                />
                <div className="mt-4 p-4 bg-white rounded-2xl border border-zinc-200 shadow-sm text-xs text-zinc-600 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-zinc-900" />
                    <span>Real-time Stamp Progression</span>
                  </div>
                  <span className="font-mono font-bold text-zinc-900">4 of 6 Completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Dashboards Showcase Section */}
      <section className="py-16 bg-white border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-zinc-950 tracking-tight sm:text-4xl">
              Three Dedicated Dashboards. One Unified Engine.
            </h2>
            <p className="mt-3 text-zinc-600 text-sm sm:text-base">
              Engineered specifically for business owners, counter cashiers, and happy repeat customers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 1. Company Dashboard */}
            <div className="bg-zinc-50 rounded-2xl p-7 border border-zinc-200 hover:border-zinc-400 transition group">
              <div className="w-11 h-11 rounded-xl bg-zinc-950 text-white flex items-center justify-center mb-6 shadow-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950 mb-2">Company Dashboard</h3>
              <p className="text-xs sm:text-sm text-zinc-600 mb-4 leading-relaxed">
                Design custom loyalty programs, set stamp thresholds, manage cashier staff logins, and view real-time customer retention metrics.
              </p>
              <ul className="space-y-2 text-xs text-zinc-600 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-800 shrink-0" />
                  Custom card branding, icons, & colors
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-800 shrink-0" />
                  Cashier accounts & shift logs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-800 shrink-0" />
                  Lifetime visit analytics & charts
                </li>
              </ul>
              <Link
                href="/company"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-950 hover:underline"
              >
                Explore Company Portal <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 2. Cashier Scanner */}
            <div className="bg-zinc-50 rounded-2xl p-7 border border-zinc-200 hover:border-zinc-400 transition group">
              <div className="w-11 h-11 rounded-xl bg-zinc-950 text-white flex items-center justify-center mb-6 shadow-sm">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950 mb-2">Cashier Scanner</h3>
              <p className="text-xs sm:text-sm text-zinc-600 mb-4 leading-relaxed">
                High-speed camera QR scanning and manual code entry. Verify customer identity, add stamp visits in 1 tap, and safely redeem rewards.
              </p>
              <ul className="space-y-2 text-xs text-zinc-600 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-800 shrink-0" />
                  Camera stream or manual code lookup
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-800 shrink-0" />
                  1-Tap &ldquo;+1 Visit Stamp&rdquo; action
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-800 shrink-0" />
                  Validated reward redemption codes
                </li>
              </ul>
              <Link
                href="/cashier"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-950 hover:underline"
              >
                Open Cashier Counter <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 3. User Digital Pass */}
            <div className="bg-zinc-50 rounded-2xl p-7 border border-zinc-200 hover:border-zinc-400 transition group">
              <div className="w-11 h-11 rounded-xl bg-zinc-950 text-white flex items-center justify-center mb-6 shadow-sm">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950 mb-2">User Dashboard</h3>
              <p className="text-xs sm:text-sm text-zinc-600 mb-4 leading-relaxed">
                Customers carry their digital loyalty cards in their phone browser. Unique permanent QR code, live stamp progress, visit history, and unlock alerts.
              </p>
              <ul className="space-y-2 text-xs text-zinc-600 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-800 shrink-0" />
                  Instant QR code modal for scanning
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-800 shrink-0" />
                  Reward countdown & unlock notifications
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-800 shrink-0" />
                  Multi-merchant card wallet
                </li>
              </ul>
              <Link
                href="/user"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-950 hover:underline"
              >
                View Customer Pass <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Step-by-Step */}
      <section className="py-20 bg-zinc-950 text-white border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-mono tracking-widest text-zinc-400">
              Simple 4-Step Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2 text-white">
              How the QR Loyalty System Operates
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 text-white flex items-center justify-center font-bold text-sm mb-4">
                1
              </div>
              <h4 className="font-bold text-base mb-2">Create Program</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Company registers, configures target stamps (e.g. 6 visits) and designates the unlocked free perk.
              </p>
            </div>

            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 text-white flex items-center justify-center font-bold text-sm mb-4">
                2
              </div>
              <h4 className="font-bold text-base mb-2">Customer Shows QR</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                User opens their digital card on mobile and displays their unique QR code or alphanumeric token at the counter.
              </p>
            </div>

            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 text-white flex items-center justify-center font-bold text-sm mb-4">
                3
              </div>
              <h4 className="font-bold text-base mb-2">Cashier Scans</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Cashier scans user QR via camera, verifies customer identity, and taps &ldquo;+1 Stamp / Visit&rdquo;.
              </p>
            </div>

            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 text-white flex items-center justify-center font-bold text-sm mb-4">
                4
              </div>
              <h4 className="font-bold text-base mb-2">Reward Unlocked</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Once customer reaches 6 stamps, the card unlocks the free service. Cashier validates and redeems instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#09090b] text-zinc-400 py-12 border-t border-zinc-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="font-semibold text-white">LoyaltyPass Platform</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-white transition">
              Sign In
            </Link>
            <Link href="/register?role=company" className="hover:text-white transition">
              For Companies
            </Link>
            <Link href="/register?role=user" className="hover:text-white transition">
              For Customers
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
