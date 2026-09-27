'use client';

import { useState } from 'react';
import { LoyaltyCard, LoyaltyProgram, Company } from '@/types';
import { WalletPassModal } from './WalletPassModal';
import {
  Star,
  Coffee,
  Gift,
  Award,
  Sparkles,
  Heart,
  QrCode,
  CheckCircle2,
  Calendar,
  Store,
  Wallet,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface LoyaltyCardVisualProps {
  card: LoyaltyCard;
  program?: LoyaltyProgram;
  company?: Company;
  onViewQr?: () => void;
  showActions?: boolean;
}

export function LoyaltyCardVisual({
  card,
  program: propProgram,
  company: propCompany,
  onViewQr,
  showActions = true,
}: LoyaltyCardVisualProps) {
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const program = propProgram || card.program;
  const company = propCompany || card.company;

  const targetStamps = program?.target_stamps || 6;
  const currentStamps = card.current_stamps || 0;
  const isRewardReady = currentStamps >= targetStamps || card.status === 'reward_ready';
  const progressPercent = Math.min(100, Math.round((currentStamps / targetStamps) * 100));

  // Determine icon to use
  const getStampIcon = (type?: string, className = 'w-5 h-5') => {
    switch (type) {
      case 'coffee':
        return <Coffee className={className} />;
      case 'gift':
        return <Gift className={className} />;
      case 'award':
        return <Award className={className} />;
      case 'sparkles':
        return <Sparkles className={className} />;
      case 'heart':
        return <Heart className={className} />;
      case 'star':
      default:
        return <Star className={className} />;
    }
  };

  return (
    <>
      <div className="relative group perspective-1000 w-full max-w-md mx-auto">
        {/* Front of Card */}
        <div
          className="w-full rounded-3xl p-6 shadow-2xl relative overflow-hidden text-white transition-all duration-300 transform group-hover:scale-[1.01]"
          style={{
            background: program?.card_bg_color && program.card_bg_color !== '#0F172A'
              ? `linear-gradient(145deg, ${program.card_bg_color} 0%, #09090b 100%)`
              : 'linear-gradient(145deg, #18181b 0%, #09090b 100%)',
            border: '1px solid #27272a',
          }}
        >
          {/* Subtle ambient background glow */}
          <div
            className="absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl opacity-15 pointer-events-none bg-zinc-400"
          />

          {/* Card Header: Company Info */}
          <div className="flex items-start justify-between relative z-10 mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-md border border-zinc-700/80 bg-zinc-800 text-white"
              >
                {company?.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <Store className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg text-white leading-tight">
                  {company?.name || 'Partner Merchant'}
                </h3>
                <p className="text-xs text-zinc-400 font-medium">
                  {company?.category || 'Loyalty Membership'}
                </p>
              </div>
            </div>

            {/* Reward Status Badge */}
            {isRewardReady ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-zinc-950 shadow-md">
                <Gift className="w-3.5 h-3.5" />
                Reward Ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 font-mono">
                {targetStamps - currentStamps} to go
              </span>
            )}
          </div>

          {/* Program Title & Reward Claim */}
          <div className="relative z-10 mb-5">
            <h4 className="text-xl font-extrabold text-white tracking-tight">
              {program?.title || 'Loyalty Rewards Pass'}
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
              Reward: <span className="font-semibold text-zinc-200">{program?.reward_title || '1 Free Reward'}</span>
            </p>
          </div>

          {/* Digital Stamp Punch Grid */}
          <div className="relative z-10 bg-zinc-950/70 backdrop-blur-md rounded-2xl p-4 border border-zinc-800 mb-5">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 justify-items-center">
              {Array.from({ length: targetStamps }).map((_, index) => {
                const stampNumber = index + 1;
                const isStamped = stampNumber <= currentStamps;
                const isFinalRewardSlot = stampNumber === targetStamps;

                return (
                  <div
                    key={index}
                    className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                      isStamped
                        ? 'shadow-md transform scale-100 bg-white text-zinc-950 ring-2 ring-white/30'
                        : 'border border-dashed border-zinc-700 bg-zinc-900/60 text-zinc-500'
                    }`}
                  >
                    {isStamped ? (
                      <div className="flex flex-col items-center justify-center animate-stamp-in text-zinc-950">
                        {isFinalRewardSlot ? (
                          <Gift className="w-5 h-5 text-zinc-950" />
                        ) : (
                          getStampIcon(program?.stamp_icon, 'w-5 h-5')
                        )}
                        <span className="text-[9px] font-black mt-0.5 leading-none">
                          ✓
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-zinc-500">
                        {isFinalRewardSlot ? (
                          <Gift className="w-4 h-4 text-zinc-500" />
                        ) : (
                          <span className="text-xs font-semibold">{stampNumber}</span>
                        )}
                        {isFinalRewardSlot && (
                          <span className="text-[8px] font-bold text-zinc-400 uppercase">
                            Free
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5 font-medium">
                <span>Current Progress</span>
                <span className="font-mono font-bold text-white">
                  {currentStamps} / {targetStamps} ({progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out bg-white"
                  style={{
                    width: `${progressPercent}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card Footer: Metadata & Actions */}
          <div className="flex items-center justify-between relative z-10 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Last: {formatDate(card.last_visit_at)}</span>
            </div>

            {showActions && (
              <div className="flex items-center gap-2">
                {/* Apple & Google Wallet Button */}
                <button
                  type="button"
                  onClick={() => setWalletModalOpen(true)}
                  className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold px-3 py-1.5 rounded-xl border border-zinc-700 shadow-sm transition transform active:scale-95 text-xs"
                  title="Add to Apple Wallet / Google Wallet"
                >
                  <Wallet className="w-3.5 h-3.5 text-zinc-400" />
                  Add to Wallet
                </button>

                {onViewQr && (
                  <button
                    type="button"
                    onClick={onViewQr}
                    className="flex items-center gap-1.5 bg-white text-zinc-950 hover:bg-zinc-100 font-semibold px-3 py-1.5 rounded-xl shadow-sm transition transform active:scale-95 text-xs"
                  >
                    <QrCode className="w-3.5 h-3.5 text-zinc-950" />
                    QR
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Wallet Pass Modal (Apple Wallet .pkpass + Google Wallet) */}
      <WalletPassModal
        card={card}
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />
    </>
  );
}
