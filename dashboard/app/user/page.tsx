'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { useAuth } from '@/hooks/use-auth';
import { userService } from '@/services/user.service';
import { orderService } from '@/services/order.service';
import { fallbackStorage } from '@/lib/fallback-storage';
import { LoyaltyCard, UserProfile, CompanyOrder } from '@/types';
import { OrderFlowModal } from '@/components/orders/OrderFlowModal';
import {
  Coffee,
  Building2,
  Car,
  Sparkles,
  Plus,
  Check,
  Gift,
  Copy,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Wallet,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';

interface CardTheme {
  bgGradient: string;
  borderColor: string;
  accentBg: string;
  badgeBg: string;
  stampActiveBg: string;
  stampActiveText: string;
  accentColor: string;
  colorName: string;
}

function getCardTheme(card?: LoyaltyCard | null): CardTheme {
  const cat = (card?.company?.category || card?.program?.title || card?.company?.name || '').toLowerCase();

  // Cafe / Coffee Shop -> Warm Espresso Amber / Roast Gold
  if (cat.includes('coffee') || cat.includes('cafe') || cat.includes('roast') || cat.includes('bakery')) {
    return {
      bgGradient: 'bg-gradient-to-br from-amber-800 via-amber-950 to-stone-950',
      borderColor: 'border-amber-600/40',
      accentBg: 'bg-black/30 border-white/10',
      badgeBg: 'bg-amber-900/90 text-amber-200 border-amber-700/60',
      stampActiveBg: 'bg-white text-stone-950',
      stampActiveText: 'text-stone-950',
      accentColor: '#f59e0b',
      colorName: 'Amber Roast',
    };
  }

  // Hotel / Hospitality / Luxury -> Deep Sapphire Indigo / Navy
  if (
    cat.includes('hotel') ||
    cat.includes('hospitality') ||
    cat.includes('stay') ||
    cat.includes('spa') ||
    cat.includes('resort')
  ) {
    return {
      bgGradient: 'bg-gradient-to-br from-indigo-900 via-blue-950 to-slate-950',
      borderColor: 'border-indigo-600/40',
      accentBg: 'bg-black/30 border-white/10',
      badgeBg: 'bg-indigo-900/90 text-indigo-200 border-indigo-700/60',
      stampActiveBg: 'bg-white text-slate-950',
      stampActiveText: 'text-slate-950',
      accentColor: '#6366f1',
      colorName: 'Sapphire Indigo',
    };
  }

  // Car Wash / Automotive -> Emerald Forest / Racing Teal
  if (cat.includes('car') || cat.includes('wash') || cat.includes('auto') || cat.includes('detailing')) {
    return {
      bgGradient: 'bg-gradient-to-br from-emerald-900 via-teal-950 to-zinc-950',
      borderColor: 'border-emerald-600/40',
      accentBg: 'bg-black/30 border-white/10',
      badgeBg: 'bg-emerald-900/90 text-emerald-200 border-emerald-700/60',
      stampActiveBg: 'bg-white text-zinc-950',
      stampActiveText: 'text-zinc-950',
      accentColor: '#10b981',
      colorName: 'Emerald Teal',
    };
  }

  // Default / Retail -> Elegant Royal Violet
  return {
    bgGradient: 'bg-gradient-to-br from-purple-900 via-slate-950 to-zinc-950',
    borderColor: 'border-purple-600/40',
    accentBg: 'bg-black/30 border-white/10',
    badgeBg: 'bg-purple-900/90 text-purple-200 border-purple-700/60',
    stampActiveBg: 'bg-white text-zinc-950',
    stampActiveText: 'text-zinc-950',
    accentColor: '#8b5cf6',
    colorName: 'Royal Violet',
  };
}

function getCardIcon(card?: LoyaltyCard | null) {
  const cat = (card?.company?.category || card?.program?.title || '').toLowerCase();
  const icon = (card?.program?.stamp_icon || '').toLowerCase();
  if (cat.includes('coffee') || cat.includes('cafe') || icon.includes('coffee')) {
    return Coffee;
  }
  if (cat.includes('hotel') || cat.includes('hospitality') || icon.includes('building')) {
    return Building2;
  }
  if (cat.includes('car') || cat.includes('wash') || cat.includes('auto') || icon.includes('car')) {
    return Car;
  }
  return Sparkles;
}

function getPassCode(card: LoyaltyCard | null, userToken: string) {
  const cat = (card?.company?.category || card?.program?.title || '').toLowerCase();
  const core = (userToken || '7B2A-9E4F').replace(/[^A-Z0-9]/gi, '').slice(-4).toUpperCase();
  if (cat.includes('coffee') || cat.includes('cafe')) {
    return `LC-CAFE-${core}`;
  }
  if (cat.includes('hotel') || cat.includes('hospitality')) {
    return `LC-HOTEL-${core}`;
  }
  if (cat.includes('car') || cat.includes('wash') || cat.includes('auto')) {
    return `LC-WASH-${core}`;
  }
  return `LC-PASS-${core}`;
}

function GoogleWalletCardsView() {
  const { profile } = useAuth();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [cards, setCards] = useState<LoyaltyCard[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [orders, setOrders] = useState<CompanyOrder[]>([]);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // 1. Load user profile, loyalty cards, and real company orders
  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);

        // Resolve user profile
        let user = profile;
        if (!user) {
          user = fallbackStorage.getCurrentUser();
        }
        if (!user) {
          const storedUsers = fallbackStorage.getUsers();
          user = storedUsers.find((u) => u.role === 'user') || {
            id: 'usr-customer-001',
            email: 'customer@example.com',
            full_name: 'Alex Johnson',
            phone: '+1 (555) 345-6789',
            role: 'user',
            company_id: null,
            qr_code_token: 'LC-7B2A-9E4F',
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          fallbackStorage.setCurrentUser(user);
        }

        if (isCancelled) return;
        setCurrentUser(user);

        // Fetch cards for user
        let userCards = await userService.getUserCards(user.id);
        if (userCards.length === 0) {
          userCards = fallbackStorage.getUserCards(user.id);
        }

        if (!isCancelled) {
          setCards(userCards);
        }

        // Fetch real company orders for user
        const userOrders = await orderService.getUserOrders(user.id);
        if (!isCancelled) {
          setOrders(userOrders);
        }
      } catch (err) {
        console.error('Failed to load loyalty cards and orders:', err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [profile]);

  const handleOrderCompleted = async (newOrder: CompanyOrder) => {
    if (currentUser?.id) {
      const updatedCards = await userService.getUserCards(currentUser.id);
      setCards(updatedCards);
      const updatedOrders = await orderService.getUserOrders(currentUser.id);
      setOrders(updatedOrders);
    }
  };

  // 2. Real-time sync when stamped at counter
  useEffect(() => {
    const handleSync = () => {
      if (currentUser?.id) {
        const updatedCards = fallbackStorage.getUserCards(currentUser.id);
        if (updatedCards.length > 0) {
          setCards(updatedCards);
        }
      }
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [currentUser?.id]);

  const activeCard = cards[activeCardIndex] || cards[0] || null;
  const activeCompany = activeCard?.company;
  const activeProgram = activeCard?.program;
  const theme = getCardTheme(activeCard);
  const ActiveIcon = getCardIcon(activeCard);

  const currentStamps = activeCard?.current_stamps ?? 0;
  const isRewardReady = currentStamps >= 6;
  const masterQrToken = currentUser?.qr_code_token || 'LC-7B2A-9E4F';
  const cardPassCode = activeCard ? getPassCode(activeCard, masterQrToken) : masterQrToken;

  // 3. Render Large Scannable QR Code
  useEffect(() => {
    if (qrCanvasRef.current && cardPassCode) {
      QRCode.toCanvas(qrCanvasRef.current, cardPassCode, {
        width: 280,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      }).catch((err) => {
        console.error('Error rendering QR code:', err);
      });
    }
  }, [cardPassCode, activeCardIndex, loading]);

  // 4. Confetti on 6/6 stamps
  useEffect(() => {
    if (isRewardReady && !loading) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isRewardReady, activeCardIndex, loading]);

  const copyPassCode = () => {
    if (cardPassCode) {
      navigator.clipboard.writeText(cardPassCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Touch swipe support on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50 && activeCardIndex < cards.length - 1) {
      setActiveCardIndex((prev) => prev + 1);
    } else if (distance < -50 && activeCardIndex > 0) {
      setActiveCardIndex((prev) => prev - 1);
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handlePrev = () => {
    if (activeCardIndex > 0) {
      setActiveCardIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (activeCardIndex < cards.length - 1) {
      setActiveCardIndex((prev) => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-[#f2d8ae] px-4 py-7 pb-24 sm:px-8 sm:py-10">
      <section className="mx-auto w-full max-w-[540px]">
        <header className="mb-8 flex items-center justify-between sm:mb-10">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-stone-600">{currentUser?.full_name || 'My'}’s pass</p>
            <h1 className="text-5xl font-black tracking-[-0.07em] text-stone-950 sm:text-6xl">Wallet</h1>
          </div>
          <div className="flex gap-3">
            <button aria-label="Your cards" className="grid h-12 w-12 place-items-center rounded-full bg-black text-white shadow-lg transition hover:scale-105 active:scale-95"><Plus className="h-6 w-6" /></button>
            <button aria-label="Add a card" className="grid h-12 w-12 place-items-center rounded-full bg-black text-white shadow-lg transition hover:scale-105 active:scale-95"><Gift className="h-6 w-6" /></button>
          </div>
        </header>

        {/* Multi-card Google Wallet Switcher Strip */}
        {cards.length > 1 && (
          <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {cards.map((c, idx) => {
              const CIcon = getCardIcon(c);
              const isSelected = idx === activeCardIndex;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCardIndex(idx)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
                    isSelected
                      ? 'bg-stone-950 text-white shadow-md scale-102 ring-2 ring-stone-900'
                      : 'bg-white/85 hover:bg-white text-stone-700 border border-stone-200/80 shadow-2xs'
                  }`}
                >
                  <CIcon className="w-3.5 h-3.5" />
                  <span>{c.company?.name || `Card ${idx + 1}`}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {c.current_stamps}/{c.program?.target_stamps || 6}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Google Wallet Style Loyalty Card */}
        <article
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`relative overflow-hidden rounded-[2rem] p-5 text-white shadow-[0_24px_50px_rgba(0,0,0,0.25)] border ${theme.borderColor} ${theme.bgGradient} sm:p-7 transition-all duration-300`}
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full border border-white/10" />

          {/* Card Top: Category, Brand, Prev/Next */}
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25 shadow-inner">
                <ActiveIcon className="h-7 w-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 text-white/90">
                    {theme.colorName}
                  </span>
                </div>
                <h2 className="truncate text-2xl sm:text-3xl font-bold tracking-tight text-white mt-0.5">
                  {activeCompany?.name || 'Loyalty Pass'}
                </h2>
                <p className="mt-0.5 truncate text-xs font-medium text-white/75">
                  {activeProgram?.title || 'Stamp Rewards'}
                </p>
              </div>
            </div>

            {cards.length > 1 && (
              <div className="flex shrink-0 items-center rounded-full bg-black/25 p-1 ring-1 ring-white/20">
                <button
                  onClick={handlePrev}
                  disabled={activeCardIndex === 0}
                  aria-label="Previous card"
                  className="rounded-full p-1.5 hover:bg-white/10 disabled:opacity-30 transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-1.5 text-xs font-bold font-mono">
                  {activeCardIndex + 1}/{cards.length}
                </span>
                <button
                  onClick={handleNext}
                  disabled={activeCardIndex === cards.length - 1}
                  aria-label="Next card"
                  className="rounded-full p-1.5 hover:bg-white/10 disabled:opacity-30 transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Stamps Box (1-6 Stamps Grid) */}
          <div className="relative mt-6 rounded-[1.45rem] bg-white p-4 shadow-inner sm:p-5">
            <div className={`grid gap-3 sm:gap-4 ${(activeProgram?.target_stamps || 6) <= 6 ? 'grid-cols-3' : 'grid-cols-4'}`}>
              {Array.from({ length: activeProgram?.target_stamps || 6 }).map((_, index) => {
                const isStamped = index < currentStamps;
                const isLast = index === (activeProgram?.target_stamps || 6) - 1;
                return (
                  <div
                    key={index}
                    className={`flex aspect-square items-center justify-center rounded-2xl transition-transform ${
                      isStamped
                        ? 'bg-zinc-950 text-white shadow-md scale-102 ring-2 ring-zinc-900'
                        : isLast
                        ? 'border-2 border-dashed border-amber-400 bg-amber-50/50 text-amber-600'
                        : 'border-2 border-dashed border-zinc-200 text-zinc-300'
                    }`}
                  >
                    {isStamped ? (
                      <ActiveIcon className="h-7 w-7 sm:h-8 sm:w-8" fill="currentColor" />
                    ) : isLast ? (
                      <Gift className="h-6 w-6 animate-pulse" />
                    ) : (
                      <ActiveIcon className="h-6 w-6 opacity-40" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Counters */}
          <div className="relative mt-4 flex items-end justify-between gap-3 text-base sm:text-lg font-bold tracking-tight">
            <span>Remaining: {Math.max(0, (activeProgram?.target_stamps || 6) - currentStamps)}</span>
            <span className="font-mono">
              Stamps: {String(currentStamps).padStart(2, '0')}/{activeProgram?.target_stamps || 6}
            </span>
          </div>
          <p className="relative mt-1 text-xs sm:text-sm font-medium text-white/80">
            {isRewardReady
              ? '🎉 Reward unlocked! Show your QR code at the counter.'
              : activeProgram?.reward_title || 'Collect stamps for your reward'}
          </p>

          {/* High-Definition QR Code Card */}
          <div className="relative mx-auto mt-6 w-fit rounded-2xl bg-white p-3.5 shadow-xl sm:mt-8">
            <canvas ref={qrCanvasRef} className="h-[180px] w-[180px] sm:h-[220px] sm:w-[220px]" />
            <p className="mt-1.5 text-center text-[11px] font-semibold tracking-tight text-zinc-700">
              Scan at counter to collect stamp
            </p>
          </div>

          {/* Pass Token & Copy Button */}
          <div className="relative mt-4 flex items-center justify-center gap-2">
            <span className="font-mono text-xs font-bold tracking-widest text-white/80 bg-black/20 px-3 py-1 rounded-lg">
              {cardPassCode}
            </span>
            <button
              onClick={copyPassCode}
              title="Copy pass code"
              className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Direct Order Button on the Active Card */}
          <button
            onClick={() => setOrderModalOpen(true)}
            className="relative mt-5 w-full py-3.5 px-4 rounded-2xl bg-white text-zinc-950 font-bold text-xs shadow-lg hover:bg-zinc-100 active:scale-98 transition flex items-center justify-center gap-2 group"
          >
            <ShoppingBag className="w-4 h-4 text-zinc-950 group-hover:scale-110 transition-transform" />
            <span>Order from {activeCompany?.name || 'Company'} (+1 Stamp)</span>
          </button>
        </article>

        {cards.length > 1 && (
          <div className="mt-5 flex justify-center gap-2">
            {cards.map((card, index) => (
              <button
                key={card.id}
                onClick={() => setActiveCardIndex(index)}
                aria-label={`Show ${card.company?.name || 'loyalty'} card`}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeCardIndex ? 'w-7 bg-stone-950' : 'w-2.5 bg-stone-950/25'
                }`}
              />
            ))}
          </div>
        )}

        {/* Company Orders Section */}
        <section className="mt-8 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-950 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-stone-950" />
                Company Orders
              </h3>
              <p className="text-[11px] text-stone-600">
                Live orders, store pickups & receipts
              </p>
            </div>
            <Link
              href="/user/orders"
              className="text-xs font-bold text-stone-950 hover:text-stone-700 flex items-center gap-1 underline underline-offset-2"
            >
              All Orders ({orders.length}) &rarr;
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white/85 backdrop-blur-sm rounded-2xl p-5 border border-stone-200/80 text-center shadow-2xs">
              <p className="text-xs text-stone-600 font-medium">No company orders placed yet.</p>
              <button
                onClick={() => setOrderModalOpen(true)}
                className="mt-2.5 inline-flex items-center gap-1.5 px-4 py-2 bg-stone-950 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-stone-800 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Place First Order
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {orders.slice(0, 3).map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-stone-200/80 shadow-2xs hover:shadow-xs transition flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-stone-950 truncate">
                        {ord.company?.name || 'Company Order'}
                      </span>
                      <span className="text-[10px] font-mono text-stone-500 font-bold">
                        {ord.order_number}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 truncate mt-0.5">
                      {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {ord.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-black font-mono text-stone-950">
                      ${ord.total_amount.toFixed(2)}
                    </p>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 mt-1 inline-block">
                      +{ord.stamps_earned} Stamp
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Interactive Order Flow Modal */}
        <OrderFlowModal
          isOpen={orderModalOpen}
          onClose={() => setOrderModalOpen(false)}
          initialCompanyId={activeCompany?.id}
          userId={currentUser?.id}
          onOrderCompleted={handleOrderCompleted}
        />
      </section>
    </main>
  );
}

export default function UserDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
        </div>
      }
    >
      <GoogleWalletCardsView />
    </Suspense>
  );
}
