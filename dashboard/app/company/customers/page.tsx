'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { companyService } from '@/services/company.service';
import { fallbackStorage } from '@/lib/fallback-storage';
import { Company, LoyaltyCard, LoyaltyProgram, UserProfile } from '@/types';
import {
  Users,
  Search,
  ArrowLeft,
  Gift,
  Award,
  Calendar,
  Sparkles,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function CompanyCustomersPage() {
  const { profile } = useAuth();
  const [customers, setCustomers] = useState<
    Array<LoyaltyCard & { user: UserProfile; program: LoyaltyProgram }>
  >([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRewardReady, setFilterRewardReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const loadCustomers = async () => {
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
          const list = await companyService.getCompanyCustomers(comp.id);
          if (!isCancelled) {
            setCustomers(list);
          }
        }
      } catch (err: any) {
        console.error('Failed to load customers:', err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadCustomers();

    const safetyTimer = setTimeout(() => {
      if (!isCancelled) setLoading(false);
    }, 1500);

    return () => {
      isCancelled = true;
      clearTimeout(safetyTimer);
    };
  }, [profile]);

  const filtered = customers.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      (item.user?.full_name && item.user.full_name.toLowerCase().includes(q)) ||
      (item.user?.email && item.user.email.toLowerCase().includes(q)) ||
      (item.user?.qr_code_token && item.user.qr_code_token.toLowerCase().includes(q));

    const matchesFilter = filterRewardReady
      ? item.current_stamps >= (item.program?.target_stamps || 6) || item.status === 'reward_ready'
      : true;

    return matchesQuery && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/company"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            Customer Directory
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Track loyalty members, stamp progressions, and reward eligibility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterRewardReady(!filterRewardReady)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
              filterRewardReady
                ? 'bg-zinc-950 text-white'
                : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            Reward Ready Only
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by customer name, email address, or QR token (e.g. LC-XXXX)..."
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 shadow-minimal"
        />
      </div>

      {/* Customers Table / Cards */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-minimal overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">QR Pass Code</th>
                <th className="py-3.5 px-6">Program</th>
                <th className="py-3.5 px-6">Current Stamps</th>
                <th className="py-3.5 px-6">Rewards Redeemed</th>
                <th className="py-3.5 px-6">Last Visit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const target = item.program?.target_stamps || 6;
                  const isReady = item.current_stamps >= target || item.status === 'reward_ready';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                            {item.user?.full_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">
                              {item.user?.full_name || 'Customer'}
                            </p>
                            <p className="text-[11px] text-slate-400">{item.user?.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-mono text-xs font-semibold bg-slate-100 px-2 py-1 rounded-md text-slate-700">
                          {item.user?.qr_code_token || '-'}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-medium text-slate-700">
                        {item.program?.title || 'Loyalty Pass'}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 font-bold text-slate-900">
                            <span>{item.current_stamps}</span>
                            <span className="text-slate-400 font-normal">/ {target}</span>
                          </div>
                          {isReady && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <Sparkles className="w-3 h-3 text-amber-600" /> Ready
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6 font-semibold text-slate-700">
                        {item.rewards_redeemed || 0} claimed
                      </td>

                      <td className="py-4 px-6 text-slate-500">
                        {formatDate(item.last_visit_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
