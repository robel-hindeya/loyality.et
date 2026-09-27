'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { companyService } from '@/services/company.service';
import { fallbackStorage } from '@/lib/fallback-storage';
import { Company, CompanyAnalytics } from '@/types';
import {
  BarChart3,
  ArrowLeft,
  Users,
  Award,
  Gift,
  TrendingUp,
  Calendar,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function CompanyAnalyticsPage() {
  const { profile } = useAuth();
  const [analytics, setAnalytics] = useState<CompanyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const loadAnalytics = async () => {
      try {
        setLoading(true);

        // 1. Resolve user profile or fallback merchant
        let currentProfile = profile;
        if (!currentProfile) {
          currentProfile = fallbackStorage.getCurrentUser();
        }
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

        // 2. Resolve company
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

        if (comp && !isCancelled) {
          const data = await companyService.getCompanyAnalytics(comp.id);
          if (!isCancelled) {
            setAnalytics(data);
          }
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    const safetyTimer = setTimeout(() => {
      if (!isCancelled) setLoading(false);
    }, 1500);

    return () => {
      isCancelled = true;
      clearTimeout(safetyTimer);
    };
  }, [profile]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      <div>
        <Link
          href="/company"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
          Platform Analytics & Reporting
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Detailed metrics on repeat customer loyalty, stamp throughput, and reward unlocks.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-minimal">
          <p className="text-xs font-medium text-zinc-500">Total Enrolled</p>
          <h3 className="text-3xl font-bold text-zinc-900 mt-1">
            {analytics?.totalCustomers ?? 0}
          </h3>
          <p className="text-[11px] text-zinc-400 mt-1">Active customer passes</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-minimal">
          <p className="text-xs font-medium text-zinc-500">Lifetime Visits Stamped</p>
          <h3 className="text-3xl font-bold text-zinc-900 mt-1">
            {analytics?.totalVisits ?? 0}
          </h3>
          <p className="text-[11px] text-zinc-400 mt-1">Recorded counter visits</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-minimal">
          <p className="text-xs font-medium text-zinc-500">Rewards Claimed</p>
          <h3 className="text-3xl font-bold text-zinc-900 mt-1">
            {analytics?.totalRewardsRedeemed ?? 0}
          </h3>
          <p className="text-[11px] text-zinc-400 mt-1">Free rewards unlocked & redeemed</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-minimal">
          <p className="text-xs font-medium text-zinc-500">Redemption Rate</p>
          <h3 className="text-3xl font-bold text-zinc-900 mt-1">
            {analytics?.redemptionRate ?? 0}%
          </h3>
          <p className="text-[11px] text-zinc-400 mt-1">Rewards / Total visits ratio</p>
        </div>
      </div>

      {/* 7-Day Chart */}
      {analytics?.visitsByDay && (
        <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-minimal space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-900">Daily Visit Frequency</h3>
              <p className="text-xs text-zinc-400">Total customer scans per day over the last week</p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-4 h-48 pt-6">
            {analytics.visitsByDay.map((day, idx) => {
              const max = Math.max(
                ...analytics.visitsByDay.map((d) => d.visits),
                5
              );
              const height = Math.max(10, Math.round((day.visits / max) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-800">{day.visits}</span>
                  <div className="w-full bg-zinc-100 rounded-t-xl h-36 flex items-end">
                    <div
                      className="w-full bg-zinc-950 hover:bg-zinc-800 rounded-t-xl transition-all"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-zinc-500">{day.date}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
