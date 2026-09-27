'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { companyService } from '@/services/company.service';
import { fallbackStorage } from '@/lib/fallback-storage';
import { Company, StampIconType } from '@/types';
import { LoyaltyCardVisual } from '@/components/loyalty/LoyaltyCardVisual';
import {
  ArrowLeft,
  Sparkles,
  Gift,
  Coffee,
  Star,
  Award,
  Heart,
  Palette,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function CreateProgramPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);

  const [title, setTitle] = useState('Buy 6 Services, Get 1 Free');
  const [description, setDescription] = useState(
    'Earn 1 stamp per qualifying visit. Once you reach 6 stamps, unlock your free reward!'
  );
  const [targetStamps, setTargetStamps] = useState(6);
  const [rewardTitle, setRewardTitle] = useState('1 Free Complimentary Service');
  const [rewardDescription, setRewardDescription] = useState('Present your digital card to the counter cashier to redeem.');
  const [cardBgColor, setCardBgColor] = useState('#0F172A');
  const [cardAccentColor, setCardAccentColor] = useState('#6366F1');
  const [stampIcon, setStampIcon] = useState<StampIconType>('star');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      let currentProfile = profile || fallbackStorage.getCurrentUser();
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
      setCompany(comp);
    };
    fetchCompany();
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) {
      setError('Company profile not found. Please ensure you are logged in as a company owner.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await companyService.createProgram(company.id, {
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
      console.error('Failed to create program:', err);
      setError(err?.message || 'Error creating program.');
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/company/programs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Programs
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Create Loyalty Program
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customize your target stamps, free service reward, and digital card appearance.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Program Configuration Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          {/* Program Title */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Program Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Buy 6 Services, Get 1 Free"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Program Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe rules or instructions for customers..."
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Target Stamps */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800">
                Visits / Stamps Required for Free Reward: <span className="text-indigo-600 font-extrabold text-sm">{targetStamps} Visits</span>
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
            <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
              <span>2 stamps</span>
              <span>6 stamps (Standard)</span>
              <span>10 stamps</span>
              <span>20 stamps</span>
            </div>
          </div>

          {/* Reward Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Reward Name *
              </label>
              <input
                type="text"
                required
                value={rewardTitle}
                onChange={(e) => setRewardTitle(e.target.value)}
                placeholder="e.g. 1 Free Specialty Drink"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Redemption Instructions
              </label>
              <input
                type="text"
                value={rewardDescription}
                onChange={(e) => setRewardDescription(e.target.value)}
                placeholder="e.g. Show QR to cashier"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Stamp Icon Selection */}
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

          {/* Card Color Palette */}
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
                    className="w-7 h-7 rounded-full border-2 border-white shadow-md flex items-center justify-center transition transform hover:scale-110"
                    style={{ backgroundColor: preset.value }}
                    title={preset.label}
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
                    className="w-7 h-7 rounded-full border-2 border-white shadow-md flex items-center justify-center transition transform hover:scale-110"
                    style={{ backgroundColor: preset.value }}
                    title={preset.label}
                  >
                    {cardAccentColor === preset.value && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              href="/company/programs"
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Program'
              )}
            </button>
          </div>
        </form>

        {/* Right Column: Real-Time Live Preview */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-extrabold text-slate-500">
              Live Customer Pass Preview
            </span>
            <span className="text-[11px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
              Updates in real-time
            </span>
          </div>

          <LoyaltyCardVisual
            card={{
              id: 'preview-card',
              user_id: 'preview-user',
              program_id: 'preview-prog',
              company_id: company?.id || 'preview-comp',
              current_stamps: Math.min(targetStamps - 1, 4),
              lifetime_stamps: 8,
              rewards_earned: 1,
              rewards_redeemed: 1,
              status: 'active',
              last_visit_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              program: {
                id: 'preview-prog',
                company_id: company?.id || 'preview-comp',
                title: title || 'Loyalty Program',
                description: description || null,
                target_stamps: targetStamps,
                reward_title: rewardTitle || '1 Free Service',
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

          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
            <div className="flex items-center gap-2 font-medium text-slate-700">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Program Summary</span>
            </div>
            <p>
              When customers complete <strong>{targetStamps} stamps</strong>, their digital card automatically notifies them that their <strong>{rewardTitle}</strong> is ready to claim at checkout!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
