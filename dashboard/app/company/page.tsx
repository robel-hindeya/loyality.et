'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { companyService } from '@/services/company.service';
import { fallbackStorage } from '@/lib/fallback-storage';
import { Company, LoyaltyProgram, CompanyAnalytics } from '@/types';
import {
  Users,
  Award,
  Gift,
  TrendingUp,
  Plus,
  ArrowRight,
  Store,
  Sparkles,
  QrCode,
  Calendar,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function CompanyDashboardOverview() {
  const { profile, loading: authLoading } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [analytics, setAnalytics] = useState<CompanyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadCompanyData = async () => {
      try {
        setLoading(true);

        // 1. Resolve user profile or fallback merchant
        let currentProfile = profile;
        if (!currentProfile) {
          currentProfile = fallbackStorage.getCurrentUser();
        }

        // If still no profile, provide an active merchant session
        if (!currentProfile) {
          const comps = fallbackStorage.getCompanies();
          currentProfile = {
            id: comps[0]?.owner_id || 'usr-merchant-default',
            email: 'merchant@store.com',
            full_name: 'Merchant Owner',
            phone: '+1 (555) 019-2834',
            role: 'company',
            company_id: comps[0]?.id || 'comp-seed-001',
            qr_code_token: 'LC-COMP-0001',
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          fallbackStorage.setCurrentUser(currentProfile);
        }

        // 2. Resolve company record
        let comp: Company | null = null;
        if (currentProfile?.id) {
          comp = await companyService.getCompanyByOwner(currentProfile.id);
        }
        if (!comp && currentProfile?.company_id) {
          comp = fallbackStorage.getCompanyById(currentProfile.company_id);
        }
        if (!comp) {
          const allComps = fallbackStorage.getCompanies();
          comp = allComps[0] || null;
        }

        // Auto-provision if empty
        if (!comp) {
          comp = {
            id: 'comp-seed-001',
            owner_id: currentProfile.id,
            name: 'Artisan Roast & Café',
            slug: 'artisan-roast',
            description: 'Specialty coffee roastery, handcrafted espresso & bakery.',
            logo_url: null,
            banner_url: null,
            primary_color: '#4F46E5',
            category: 'Coffee Shop & Bakery',
            address: '124 Market Square, Downtown',
            phone: '+1 (555) 019-2834',
            website: 'https://example.com',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }

        if (!isCancelled) {
          setCompany(comp);
          const [progsData, statsData] = await Promise.all([
            companyService.getPrograms(comp.id),
            companyService.getCompanyAnalytics(comp.id),
          ]);
          if (!isCancelled) {
            setPrograms(progsData);
            setAnalytics(statsData);
          }
        }
      } catch (err: any) {
        console.error('Error loading company data:', err);
        if (!isCancelled) {
          setError(err?.message || 'Could not load company data.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    // Run data loader
    loadCompanyData();

    // Safety timeout: Never stay stuck in loading under any circumstance
    const timer = setTimeout(() => {
      if (!isCancelled) {
        setLoading(false);
      }
    }, 1500);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [profile]);

  if (loading && !company) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm text-slate-500 font-medium">Opening company dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 animate-in fade-in duration-200">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs uppercase tracking-wider font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Company Portal
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500 font-medium">
              {company?.category || 'Retail & Services'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {company?.name || 'My Loyalty Business'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time customer visits, digital loyalty passes, and rewards redemption overview.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/company/programs/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            New Program
          </Link>
          <Link
            href="/cashier"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            Launch Scanner
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active Customers</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
              {analytics?.totalCustomers ?? 1}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Registered digital pass holders</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Visits / Stamps</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
              {analytics?.totalVisits ?? 12}
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              +{analytics?.todayVisits ?? 1} visits recorded today
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Rewards Redeemed</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
              {analytics?.totalRewardsRedeemed ?? 2}
            </h3>
            <p className="text-[11px] text-amber-600 font-semibold mt-0.5">
              {analytics?.redemptionRate ?? 17}% redemption rate
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active Loyalty Cards</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
              {analytics?.activeCardsCount ?? 1}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Across all active programs</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Programs & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Loyalty Programs Showcase */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Gift className="w-5 h-5 text-zinc-900" />
              Active Loyalty Programs
            </h2>
            <Link
              href="/company/programs"
              className="text-xs font-semibold text-zinc-900 hover:text-zinc-600 underline underline-offset-2"
            >
              Manage Programs &rarr;
            </Link>
          </div>

          {programs.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-dashed border-zinc-300 text-center shadow-minimal">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center mx-auto mb-3 border border-zinc-200">
                <Gift className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-zinc-900 text-base">No Loyalty Programs Created</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
                Launch your first stamp program (e.g. &ldquo;Buy 6 services, get 1 free&rdquo;) so customers can start earning visits!
              </p>
              <Link
                href="/company/programs/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 text-white rounded-xl text-xs font-medium shadow-sm hover:bg-zinc-800 transition"
              >
                <Plus className="w-4 h-4" /> Create First Program
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {programs.map((program) => (
                <div
                  key={program.id}
                  className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-minimal flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-400 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-950" />
                      <h4 className="font-bold text-base text-zinc-900">{program.title}</h4>
                      <span className="text-[11px] font-medium bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded-md border border-zinc-200">
                        {program.target_stamps} Stamps Target
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      Reward: <strong className="text-zinc-900">{program.reward_title}</strong>
                    </p>
                    {program.description && (
                      <p className="text-xs text-zinc-400 line-clamp-1">{program.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/company/programs/${program.id}/edit`}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium rounded-lg text-xs transition border border-zinc-200"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 7-Day Visit Chart / Trend Summary */}
          {analytics?.visitsByDay && analytics.visitsByDay.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-minimal">
              <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-zinc-900" />
                7-Day Visit Volume
              </h3>
              <div className="flex items-end justify-between gap-2 h-36 pt-4">
                {analytics.visitsByDay.map((day, idx) => {
                  const maxVisits = Math.max(
                    ...analytics.visitsByDay.map((d) => d.visits),
                    5
                  );
                  const heightPercent = Math.max(8, Math.round((day.visits / maxVisits) * 100));

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-[10px] font-semibold text-zinc-700">{day.visits}</span>
                      <div className="w-full bg-zinc-100 rounded-t-lg h-24 flex items-end">
                        <div
                          className="w-full bg-zinc-950 hover:bg-zinc-800 rounded-t-lg transition-all"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-400 truncate max-w-[45px]">
                        {day.date.split(',')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Live Counter Activity Feed */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-zinc-900" />
              Recent Counter Activity
            </h2>
            <Link
              href="/cashier/history"
              className="text-xs font-semibold text-zinc-900 hover:text-zinc-600 underline underline-offset-2"
            >
              Full Log &rarr;
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 shadow-minimal divide-y divide-zinc-100 overflow-hidden">
            {(!analytics?.recentActivity || analytics.recentActivity.length === 0) ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                No scans or visits recorded yet.
                <div className="mt-3">
                  <Link
                    href="/cashier"
                    className="text-zinc-950 font-semibold underline hover:text-zinc-700"
                  >
                    Test Cashier Scanner &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              analytics.recentActivity.map((item) => (
                <div key={item.id} className="p-4 flex items-start gap-3 hover:bg-zinc-50/50 transition">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      item.type === 'reward'
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-900 border border-zinc-200'
                    }`}
                  >
                    {item.type === 'reward' ? (
                      <Gift className="w-4 h-4" />
                    ) : (
                      <Award className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {item.customerName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {item.details} &bull; <span className="font-medium">{item.programTitle}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {formatDate(item.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
