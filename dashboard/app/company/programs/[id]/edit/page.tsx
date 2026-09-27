'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { companyService } from '@/services/company.service';
import { fallbackStorage } from '@/lib/fallback-storage';
import { Company, LoyaltyProgram, StampIconType } from '@/types';
import { LoyaltyCardVisual } from '@/components/loyalty/LoyaltyCardVisual';
import {
  ArrowLeft,
  Sparkles,
  Gift,
  Coffee,
  Star,
  Award,
  Heart,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function EditProgramPage() {
  const router = useRouter();
  const params = useParams();
  const programId = params.id as string;
  const { profile } = useAuth();

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetStamps, setTargetStamps] = useState(6);
  const [rewardTitle, setRewardTitle] = useState('');
  const [rewardDescription, setRewardDescription] = useState('');
  const [cardBgColor, setCardBgColor] = useState('#0F172A');
  const [cardAccentColor, setCardAccentColor] = useState('#6366F1');
  const [stampIcon, setStampIcon] = useState<StampIconType>('star');

  useEffect(() => {
    let isCancelled = false;

    const loadProgram = async () => {
      try {
        setLoading(true);
        if (!programId) return;

        let prog = await companyService.getProgramById(programId);
        if (!prog) {
          prog = fallbackStorage.getProgramById(programId);
        }

        if (prog && !isCancelled) {
          setTitle(prog.title);
          setDescription(prog.description || '');
          setTargetStamps(prog.target_stamps);
          setRewardTitle(prog.reward_title);
          setRewardDescription(prog.reward_description || '');
          setCardBgColor(prog.card_bg_color || '#0F172A');
          setCardAccentColor(prog.card_accent_color || '#6366F1');
          setStampIcon(prog.stamp_icon || 'star');

          let comp: Company | null | undefined = prog.company;
          if (!comp) {
            comp = fallbackStorage.getCompanyById(prog.company_id);
          }
          if (!comp) {
            comp = fallbackStorage.getCompanies()[0] || null;
          }
          setCompany(comp || null);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err?.message || 'Failed to load program');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadProgram();

    const safetyTimer = setTimeout(() => {
      if (!isCancelled) setLoading(false);
    }, 1500);

    return () => {
      isCancelled = true;
      clearTimeout(safetyTimer);
    };
  }, [profile, programId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await companyService.updateProgram(programId, {
        title,
        description,
        target_stamps: Number(targetStamps),
        reward_title: rewardTitle,
        reward_description: rewardDescription,
        card_bg_color: cardBgColor,
        card_accent_color: cardAccentColor,
        stamp_icon: stampIcon,
      });

      router.push('/company/programs');
    } catch (err: any) {
      console.error('Failed to update program:', err);
      setError(err?.message || 'Error updating program.');
    } finally {
      setSaving(false);
    }
  };

  const bgPresets = [
    { label: 'Slate Night', value: '#0F172A' },
    { label: 'Royal Indigo', value: '#1E1B4B' },
    { label: 'Deep Emerald', value: '#064E3B' },
    { label: 'Espresso Roast', value: '#27170E' },
    { label: 'Midnight Plum', value: '#3B0764' },
  ];

  const accentPresets = [
    { label: 'Indigo', value: '#6366F1' },
    { label: 'Emerald', value: '#10B981' },
    { label: 'Amber', value: '#F59E0B' },
    { label: 'Rose', value: '#F43F5E' },
    { label: 'Cyan', value: '#06B6D4' },
  ];

  const iconOptions: Array<{ id: StampIconType; label: string; icon: any }> = [
    { id: 'star', label: 'Star', icon: Star },
    { id: 'coffee', label: 'Coffee Cup', icon: Coffee },
    { id: 'gift', label: 'Gift Box', icon: Gift },
    { id: 'award', label: 'Award Medal', icon: Award },
    { id: 'sparkles', label: 'Sparkles', icon: Sparkles },
    { id: 'heart', label: 'Heart', icon: Heart },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      <div>
        <Link
          href="/company/programs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Programs
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Edit Loyalty Program
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Modify program rewards, visit rules, and card styling.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Program Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Program Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800">
                Target Visits / Stamps: <span className="text-indigo-600 font-extrabold text-sm">{targetStamps} Stamps</span>
              </label>
            </div>
            <input
              type="range"
              min={2}
              max={20}
              value={targetStamps}
              onChange={(e) => setTargetStamps(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Reward Name *
              </label>
              <input
                type="text"
                required
                value={rewardTitle}
                onChange={(e) => setRewardTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Redemption Rules
              </label>
              <input
                type="text"
                value={rewardDescription}
                onChange={(e) => setRewardDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Stamp Icon
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {iconOptions.map((item) => {
                const Icon = item.icon;
                const isSelected = stampIcon === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setStampIcon(item.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-[10px]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Card Background Theme
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {bgPresets.map((preset) => (
                  <button
                    type="button"
                    key={preset.value}
                    onClick={() => setCardBgColor(preset.value)}
                    className="w-7 h-7 rounded-full border-2 border-white shadow-md flex items-center justify-center transition"
                    style={{ backgroundColor: preset.value }}
                  >
                    {cardBgColor === preset.value && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Stamp Accent Color
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {accentPresets.map((preset) => (
                  <button
                    type="button"
                    key={preset.value}
                    onClick={() => setCardAccentColor(preset.value)}
                    className="w-7 h-7 rounded-full border-2 border-white shadow-md flex items-center justify-center transition"
                    style={{ backgroundColor: preset.value }}
                  >
                    {cardAccentColor === preset.value && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              href="/company/programs"
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md transition flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>

        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <LoyaltyCardVisual
            card={{
              id: 'preview-card',
              user_id: 'preview-user',
              program_id: programId,
              company_id: company?.id || 'comp',
              current_stamps: Math.min(targetStamps - 1, 3),
              lifetime_stamps: 6,
              rewards_earned: 0,
              rewards_redeemed: 0,
              status: 'active',
              last_visit_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              program: {
                id: programId,
                company_id: company?.id || 'comp',
                title: title || 'Loyalty Program',
                description: description || null,
                target_stamps: targetStamps,
                reward_title: rewardTitle || 'Free Reward',
                reward_description: rewardDescription || null,
                card_bg_color: cardBgColor,
                card_accent_color: cardAccentColor,
                stamp_icon: stampIcon,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              company: company || undefined,
            }}
            showActions={false}
          />
        </div>
      </div>
    </div>
  );
}
