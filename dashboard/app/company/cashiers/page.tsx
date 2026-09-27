'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { companyService } from '@/services/company.service';
import { authService } from '@/services/auth.service';
import { fallbackStorage } from '@/lib/fallback-storage';
import { Company, UserProfile } from '@/types';
import {
  Users,
  UserPlus,
  ArrowLeft,
  Mail,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  Store,
  Loader2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function CompanyCashiersPage() {
  const { profile } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [cashiers, setCashiers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // New Cashier modal / form
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadCashiers = async () => {
      try {
        setLoading(true);
        const currentProfile = profile || fallbackStorage.getCurrentUser();
        let comp: Company | null = null;
        if (currentProfile?.id) {
          comp = await companyService.getCompanyByOwner(currentProfile.id);
        }
        if (!comp && currentProfile?.company_id) {
          comp = fallbackStorage.getCompanyById(currentProfile.company_id);
        }
        if (!comp) {
          comp = fallbackStorage.getCompanies()[0] || null;
        }

        if (comp && !isCancelled) {
          setCompany(comp);
          const list = await companyService.getCashiers(comp.id);
          if (!isCancelled) setCashiers(list);
        }
      } catch (err: any) {
        console.error('Failed to load cashiers:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    loadCashiers();

    const timer = setTimeout(() => {
      if (!isCancelled) setLoading(false);
    }, 1500);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [profile]);

  const handleCreateCashier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    setSubmitting(true);
    setFormError(null);
    setSuccessNotice(null);

    try {
      // Create user with role: 'cashier' and company_id
      const supabase = (await import('@/lib/supabase/client')).createClient();
      const qrToken = `CSH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Register staff via auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: 'cashier',
            company_id: company.id,
            qr_code_token: qrToken,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Upsert cashier profile linked to this company
        await supabase.from('profiles').upsert({
          id: authData.user.id,
          email,
          full_name: name,
          role: 'cashier',
          company_id: company.id,
          qr_code_token: qrToken,
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        });
      }

      setSuccessNotice(`Cashier "${name}" created successfully! They can log in with ${email}.`);
      setName('');
      setEmail('');
      setPassword('');
      setShowAddForm(false);

      // Refresh list
      const updatedList = await companyService.getCashiers(company.id);
      setCashiers(updatedList);
    } catch (err: any) {
      console.error('Error creating cashier:', err);
      setFormError(err?.message || 'Failed to create cashier account.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyCounterLink = () => {
    const url = `${window.location.origin}/cashier`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

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
            Cashier Staff Management
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Authorize front-desk and checkout team members to scan customer QR passes and redeem rewards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyCounterLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-medium border border-zinc-200 transition"
            title="Copy Cashier Counter Link"
          >
            {copiedLink ? <Check className="w-4 h-4 text-zinc-900" /> : <Copy className="w-4 h-4" />}
            Copy Scanner URL
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-medium shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" /> Add Cashier
          </button>
        </div>
      </div>

      {successNotice && (
        <div className="p-4 bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded-xl flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Add Cashier Drawer Form */}
      {showAddForm && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-minimal animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-zinc-900" />
              <h3 className="font-bold text-zinc-900 text-base">New Cashier Login</h3>
            </div>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs font-semibold text-zinc-400 hover:text-zinc-700"
            >
              Cancel
            </button>
          </div>

          {formError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreateCashier} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Cashier Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Miller"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Staff Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@store.com"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Temporary Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 chars"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-xl text-xs font-medium shadow-sm transition flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Staff Member...
                  </>
                ) : (
                  'Confirm & Authorize'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cashiers Roster List */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-minimal overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-zinc-900" />
            <h3 className="font-bold text-zinc-900 text-base">Authorized Cashier Roster</h3>
          </div>
          <span className="text-xs font-medium text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-200">
            {cashiers.length} Staff Members
          </span>
        </div>

        {cashiers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Store className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No specific cashier accounts added yet.</p>
            <p className="text-[11px] text-slate-400 mt-1">
              You can also use your main Company Account directly to scan passes on the Cashier Counter screen.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {cashiers.map((cashier) => (
              <div
                key={cashier.id}
                className="p-5 flex items-center justify-between hover:bg-slate-50/60 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                    {cashier.full_name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 leading-tight">
                      {cashier.full_name}
                    </h4>
                    <p className="text-xs text-slate-400">{cashier.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    <ShieldCheck className="w-3.5 h-3.5" /> Authorized Scanner
                  </span>
                  <span className="text-slate-400 text-[11px] hidden sm:inline">
                    Added: {formatDate(cashier.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
