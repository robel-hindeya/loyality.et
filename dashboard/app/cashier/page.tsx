'use client';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/hooks/use-auth';
import { cashierService } from '@/services/cashier.service';
import { companyService } from '@/services/company.service';
import { fallbackStorage } from '@/lib/fallback-storage';
import { UserProfile, LoyaltyCard, LoyaltyProgram, Company } from '@/types';
import { QrScannerModal } from '@/components/qr/QrScannerModal';
import {
  QrCode,
  CheckCircle2,
  Gift,
  AlertCircle,
  Loader2,
  RefreshCw,
  Check,
  UserCheck,
  ArrowRight,
  Coffee,
} from 'lucide-react';

export default function CashierDashboardPage() {
  const { profile } = useAuth();

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  // Flow states: 'idle' | 'verifying' | 'ready_to_approve' | 'approved'
  const [flowState, setFlowState] = useState<'idle' | 'verifying' | 'ready_to_approve' | 'approved'>('idle');

  // Customer & card state
  const [scannedCustomer, setScannedCustomer] = useState<UserProfile | null>(null);
  const [activeCard, setActiveCard] = useState<LoyaltyCard | null>(null);
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);

  // Action states
  const [isApproving, setIsApproving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [approvedMessage, setApprovedMessage] = useState<string | null>(null);
  const [autoResetTimer, setAutoResetTimer] = useState<number | null>(null);

  // Initialize company ID
  useEffect(() => {
    const initCompany = async () => {
      try {
        let compId = profile?.company_id;

        if (!compId && profile?.role === 'company' && profile?.id) {
          const comp = await companyService.getCompanyByOwner(profile.id);
          if (comp) {
            compId = comp.id;
            setCompany(comp);
          }
        }

        // Fallback store resolution
        if (!compId) {
          const comps = fallbackStorage.getCompanies();
          if (comps.length > 0) {
            compId = comps[0].id;
            setCompany(comps[0]);
          }
        }

        if (compId) {
          setCompanyId(compId);
        }
      } catch (err) {
        console.warn('Cashier company init warning:', err);
      }
    };

    initCompany();
  }, [profile]);

  // Handle successful QR scan
  const handleScanSuccess = async (qrToken: string) => {
    setScannerOpen(false);
    setErrorMessage(null);

    const targetCompanyId = companyId || fallbackStorage.getCompanies()[0]?.id || 'comp-seed-001';
    setCompanyId(targetCompanyId);

    setFlowState('verifying');

    try {
      const result = await cashierService.verifyCustomerByQrToken(qrToken, targetCompanyId);
      setScannedCustomer(result.customer);
      setActiveCard(result.card);
      setProgram(result.program);
      setFlowState('ready_to_approve');
    } catch (err: any) {
      console.error('Scan verify error:', err);
      setErrorMessage(err?.message || 'Invalid or unrecognized customer QR pass.');
      setFlowState('idle');
    }
  };

  // Cashier clicks "APPROVE"
  const handleApprove = async () => {
    if (!activeCard || !scannedCustomer || !program) return;
    const targetCompanyId = companyId || fallbackStorage.getCompanies()[0]?.id || 'comp-seed-001';

    setIsApproving(true);
    setErrorMessage(null);

    const isReadyForReward = (activeCard.current_stamps || 0) >= 6;

    try {
      if (isReadyForReward) {
        // Redeem reward
        const res = await cashierService.redeemCustomerReward({
          cardId: activeCard.id,
          userId: scannedCustomer.id,
          companyId: targetCompanyId,
          programId: program.id,
          cashierId: profile?.id,
          rewardTitle: program.reward_title,
        });

        setActiveCard(res.card);
        setApprovedMessage(`🎉 Free reward redeemed! Voucher: ${res.redemptionCode}`);
      } else {
        // Add visit stamp
        const res = await cashierService.addVisitStamp({
          cardId: activeCard.id,
          userId: scannedCustomer.id,
          companyId: targetCompanyId,
          programId: program.id,
          cashierId: profile?.id,
          stampsToAdd: 1,
        });

        setActiveCard(res.card);
        setApprovedMessage(
          res.rewardUnlocked
            ? `🎉 Visit approved! Customer has completed 6/6 stamps and unlocked their free reward!`
            : `✓ Visit approved! Customer now has ${res.newStamps} of 6 stamps.`
        );
      }

      // Celebratory confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setFlowState('approved');

      // Auto-repeat countdown: reset in 4 seconds if not clicked
      const timer = window.setTimeout(() => {
        handleRepeatAgain();
      }, 4000);
      setAutoResetTimer(timer);
    } catch (err: any) {
      console.error('Error approving stamp:', err);
      setErrorMessage(err?.message || 'Failed to approve stamp. Please try again.');
    } finally {
      setIsApproving(false);
    }
  };

  // Reset and "REPEAT AGAIN"
  const handleRepeatAgain = (openScannerDirectly = false) => {
    if (autoResetTimer) {
      clearTimeout(autoResetTimer);
      setAutoResetTimer(null);
    }
    setScannedCustomer(null);
    setActiveCard(null);
    setProgram(null);
    setErrorMessage(null);
    setApprovedMessage(null);
    setFlowState('idle');

    if (openScannerDirectly) {
      setScannerOpen(true);
    }
  };

  const currentStamps = activeCard?.current_stamps || 0;
  const isRewardReady = currentStamps >= 6;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8 bg-[#fafafa] pb-24 md:pb-8">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-minimal-md space-y-6">
        {/* Terminal Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200 mb-2">
            <Coffee className="w-3.5 h-3.5" />
            <span>{company?.name || 'Artisan Roast & Café'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
            Cashier Terminal
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Scan customer QR pass, approve stamps, and repeat.
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-bold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* STATE 1: IDLE - BIG SCAN ICON */}
        {flowState === 'idle' && (
          <div className="space-y-6 py-4 text-center">
            {/* Clickable Big Scan Button */}
            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className="w-40 h-40 sm:w-48 sm:h-48 mx-auto rounded-3xl bg-zinc-950 hover:bg-zinc-900 active:scale-95 text-white flex flex-col items-center justify-center border border-zinc-800 shadow-xl transition-all duration-200 group cursor-pointer"
            >
              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 group-hover:scale-110 transition-transform">
                <QrCode className="w-14 h-14 sm:w-16 sm:h-16 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-bold tracking-wider mt-3 text-zinc-200">
                CLICK TO SCAN QR
              </span>
            </button>

            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-700">
                Ready for next customer in line
              </p>
              <p className="text-[11px] text-zinc-400">
                Tap the scan icon above to open camera scanner
              </p>
            </div>
          </div>
        )}

        {/* STATE 2: VERIFYING LOADER */}
        {flowState === 'verifying' && (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-zinc-950 mx-auto" />
            <p className="text-sm font-semibold text-zinc-900">
              Verifying Customer Pass...
            </p>
            <p className="text-xs text-zinc-400">Reading card stamps and eligibility</p>
          </div>
        )}

        {/* STATE 3: SCANNED - CHOOSE "APPROVE" */}
        {flowState === 'ready_to_approve' && scannedCustomer && (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Customer Details Pill */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold text-sm">
                  {scannedCustomer.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-zinc-900">
                      {scannedCustomer.full_name || 'Customer'}
                    </h3>
                    <UserCheck className="w-3.5 h-3.5 text-zinc-700" />
                  </div>
                  <p className="text-xs font-mono text-zinc-500">
                    {scannedCustomer.qr_code_token}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-zinc-800 bg-white px-2.5 py-1 rounded-lg border border-zinc-200 shadow-sm">
                {currentStamps} / 6 Stamps
              </span>
            </div>

            {/* Stamp Slots (1 - 6) */}
            <div className="bg-zinc-950 text-white p-5 rounded-2xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                <span>STAMP CARD PROGRESS</span>
                <span className="text-white font-mono">{currentStamps} / 6</span>
              </div>

              {/* 6 Slots */}
              <div className="grid grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6].map((slotNum) => {
                  const isStamped = currentStamps >= slotNum;
                  const isNextStamp = currentStamps + 1 === slotNum;
                  const isReward = slotNum === 6;

                  return (
                    <div
                      key={slotNum}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${
                        isStamped
                          ? 'bg-white text-zinc-950 font-bold shadow-sm'
                          : isNextStamp
                          ? 'bg-zinc-800 border-2 border-dashed border-white text-white animate-pulse'
                          : 'bg-zinc-900 border border-dashed border-zinc-700 text-zinc-500'
                      }`}
                    >
                      {isStamped ? (
                        <Check className="w-4 h-4 text-zinc-950 stroke-[3]" />
                      ) : isNextStamp ? (
                        <span className="text-xs font-bold text-white">+1</span>
                      ) : isReward ? (
                        <Gift className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <span className="text-xs font-mono font-semibold">{slotNum}</span>
                      )}
                      <span className="text-[8px] mt-0.5 font-medium opacity-80">
                        {isReward ? 'FREE' : `#${slotNum}`}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-zinc-400 text-center font-medium pt-1">
                {isRewardReady
                  ? '🎁 Customer has reached 6 stamps! Click approve to redeem reward.'
                  : `Approving will stamp slot #${Math.min(currentStamps + 1, 6)}`}
              </p>
            </div>

            {/* BIG APPROVE BUTTON */}
            <button
              type="button"
              onClick={handleApprove}
              disabled={isApproving}
              className="w-full py-4 px-6 bg-zinc-950 hover:bg-zinc-800 active:scale-95 disabled:opacity-50 text-white rounded-2xl font-bold text-base shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isApproving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Approving...
                </>
              ) : isRewardReady ? (
                <>
                  <Gift className="w-5 h-5" />
                  APPROVE FREE REWARD
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  APPROVE +1 STAMP
                </>
              )}
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => handleRepeatAgain(false)}
              className="w-full py-2.5 text-xs font-semibold text-zinc-400 hover:text-zinc-700 transition"
            >
              Cancel & Scan Another
            </button>
          </div>
        )}

        {/* STATE 4: APPROVED - REPEAT AGAIN */}
        {flowState === 'approved' && (
          <div className="py-4 text-center space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Confirmation Check icon */}
            <div className="w-16 h-16 rounded-full bg-zinc-950 text-white flex items-center justify-center mx-auto shadow-lg">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-zinc-950">
                Successfully Approved!
              </h2>
              <p className="text-xs text-zinc-500 font-medium">
                {approvedMessage}
              </p>
            </div>

            {/* REPEAT AGAIN BUTTON */}
            <button
              type="button"
              onClick={() => handleRepeatAgain(true)}
              className="w-full py-4 px-6 bg-zinc-950 hover:bg-zinc-800 active:scale-95 text-white rounded-2xl font-bold text-sm shadow-xl transition flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              REPEAT AGAIN (SCAN NEXT)
            </button>

            <button
              type="button"
              onClick={() => handleRepeatAgain(false)}
              className="w-full text-xs font-medium text-zinc-400 hover:text-zinc-600 transition"
            >
              Back to Idle Screen
            </button>
          </div>
        )}
      </div>

      {/* QR Scanner Camera Modal */}
      <QrScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
}
