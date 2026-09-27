'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { companyService } from '@/services/company.service';
import { fallbackStorage } from '@/lib/fallback-storage';
import { LoyaltyProgram, Company } from '@/types';
import {
  Gift,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { LoyaltyCardVisual } from '@/components/loyalty/LoyaltyCardVisual';

export default function CompanyProgramsPage() {
  const { profile } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
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
          const progs = await companyService.getPrograms(comp.id);
          if (!isCancelled) setPrograms(progs);
        }
      } catch (err) {
        console.error('Error loading programs:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    loadData();

    const timer = setTimeout(() => {
      if (!isCancelled) setLoading(false);
    }, 1500);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [profile]);

  const handleDelete = async (programId: string) => {
    if (!confirm('Are you sure you want to delete this loyalty program?')) return;
    try {
      setDeletingId(programId);
      await companyService.deleteProgram(programId);
      setPrograms((prev) => prev.filter((p) => p.id !== programId));
    } catch (err: any) {
      alert(err?.message || 'Failed to delete program');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleProgramStatus = async (program: LoyaltyProgram) => {
    try {
      const updated = await companyService.updateProgram(program.id, {
        is_active: !program.is_active,
      });
      setPrograms((prev) => prev.map((p) => (p.id === program.id ? updated : p)));
    } catch (err: any) {
      alert(err?.message || 'Failed to update program status');
    }
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
            Loyalty Programs
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Configure stamp cards, target visit requirements, and free service rewards.
          </p>
        </div>

        <Link
          href="/company/programs/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-medium shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create New Program
        </Link>
      </div>

      {programs.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-zinc-300 text-center shadow-minimal">
          <Gift className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
          <h3 className="font-bold text-zinc-800 text-base">No Loyalty Programs</h3>
          <p className="text-xs text-zinc-500 mt-1 mb-6">
            Get started by creating your first customer loyalty card program.
          </p>
          <Link
            href="/company/programs/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-950 text-white text-xs font-medium rounded-xl shadow-sm hover:bg-zinc-800 transition"
          >
            <Plus className="w-4 h-4" /> Create Program
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {programs.map((program) => (
            <div
              key={program.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      program.is_active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {program.is_active ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-slate-400" /> Inactive
                      </>
                    )}
                  </span>

                  <div className="flex items-center gap-1">
                    <Link
                      href={`/company/programs/${program.id}/edit`}
                      className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                      title="Edit Program"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(program.id)}
                      disabled={deletingId === program.id}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Program"
                    >
                      {deletingId === program.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Visual Preview */}
                <LoyaltyCardVisual
                  card={{
                    id: 'preview',
                    user_id: 'preview',
                    program_id: program.id,
                    company_id: program.company_id,
                    current_stamps: Math.ceil(program.target_stamps / 2),
                    lifetime_stamps: program.target_stamps,
                    rewards_earned: 0,
                    rewards_redeemed: 0,
                    status: 'active',
                    last_visit_at: new Date().toISOString(),
                    created_at: program.created_at,
                    updated_at: program.updated_at,
                    program,
                    company: company || undefined,
                  }}
                  showActions={false}
                />
              </div>

              {/* Controls */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  {program.target_stamps} visits &rarr; Free &ldquo;{program.reward_title}&rdquo;
                </span>

                <button
                  onClick={() => toggleProgramStatus(program)}
                  className="font-semibold text-zinc-900 hover:text-zinc-600 underline underline-offset-2 transition"
                >
                  {program.is_active ? 'Deactivate' : 'Activate Program'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
