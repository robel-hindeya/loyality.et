'use client';

import { useState, useEffect } from 'react';
import { orderService } from '@/services/order.service';
import { fallbackStorage } from '@/lib/fallback-storage';
import { Company, CompanyProduct, OrderItem, PickupType, CompanyOrder } from '@/types';
import confetti from 'canvas-confetti';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  Coffee,
  Building2,
  Car,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Store,
  Loader2,
  Receipt,
  Utensils,
} from 'lucide-react';

interface OrderFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCompanyId?: string;
  userId?: string;
  onOrderCompleted?: (order: CompanyOrder) => void;
}

export function OrderFlowModal({
  isOpen,
  onClose,
  initialCompanyId,
  userId,
  onOrderCompleted,
}: OrderFlowModalProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(initialCompanyId || '');
  const [products, setProducts] = useState<CompanyProduct[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [pickupType, setPickupType] = useState<PickupType>('in_store');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CompanyOrder | null>(null);

  // Load companies
  useEffect(() => {
    const comps = fallbackStorage.getCompanies();
    setCompanies(comps);
    if (!selectedCompanyId && comps.length > 0) {
      setSelectedCompanyId(initialCompanyId || comps[0].id);
    }
  }, [initialCompanyId, isOpen]);

  // Load products for selected company
  useEffect(() => {
    if (selectedCompanyId) {
      orderService.getCompanyProducts(selectedCompanyId).then((prods) => {
        setProducts(prods);
        setCart({});
      });
    }
  }, [selectedCompanyId]);

  if (!isOpen) return null;

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId) || companies[0];

  const getCompanyIcon = (cat?: string | null) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('coffee') || c.includes('cafe')) return Coffee;
    if (c.includes('hotel') || c.includes('hospitality')) return Building2;
    if (c.includes('car') || c.includes('wash') || c.includes('auto')) return Car;
    return Store;
  };

  const CompanyIcon = getCompanyIcon(selectedCompany?.category);

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: next };
    });
  };

  // Cart calculations
  const cartItems: OrderItem[] = Object.entries(cart).map(([prodId, qty]) => {
    const prod = products.find((p) => p.id === prodId)!;
    return {
      id: prod.id,
      name: prod.name,
      price: prod.price,
      quantity: qty,
      category: prod.category,
    };
  });

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalAmount = Math.round(subtotal * 100) / 100;
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0 || !selectedCompany) return;

    try {
      setSubmitting(true);
      const effectiveUserId =
        userId ||
        fallbackStorage.getCurrentUser()?.id ||
        'usr-customer-001';

      // Find user card for this company to get card_id and program_id
      const userCards = fallbackStorage.getUserCards(effectiveUserId);
      const matchingCard = userCards.find((c) => c.company_id === selectedCompany.id);

      const newOrder = await orderService.createOrder({
        userId: effectiveUserId,
        companyId: selectedCompany.id,
        programId: matchingCard?.program_id,
        cardId: matchingCard?.id,
        items: cartItems,
        totalAmount,
        pickupType,
        specialInstructions: specialInstructions.trim() || undefined,
        stampsEarned: 1,
      });

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });

      setCompletedOrder(newOrder);
      if (onOrderCompleted) {
        onOrderCompleted(newOrder);
      }
    } catch (err) {
      console.error('Failed to place order:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCompletedOrder(null);
    setCart({});
    setSpecialInstructions('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 leading-tight">
                {completedOrder ? 'Order Confirmed' : 'New Company Order'}
              </h2>
              <p className="text-[11px] text-zinc-500">
                {completedOrder ? 'Your order has been sent to the store' : 'Choose company, items & place order'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-zinc-200/80 text-zinc-400 hover:text-zinc-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {completedOrder ? (
          /* Order Confirmation View */
          <div className="p-6 text-center space-y-5 overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Order Received • {completedOrder.status.toUpperCase()}
              </span>
              <h3 className="text-2xl font-black text-zinc-900 mt-2 font-mono">
                {completedOrder.order_number}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                {selectedCompany?.name} • Pickup: {completedOrder.pickup_type.replace('_', ' ')}
              </p>
            </div>

            {/* Loyalty Stamps Earned Callout */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-left flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-950">
                  +1 Loyalty Stamp Earned!
                </p>
                <p className="text-[11px] text-amber-800">
                  Your digital wallet card has been stamped automatically.
                </p>
              </div>
            </div>

            {/* Itemized Receipt */}
            <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200 text-left space-y-2 text-xs">
              <p className="font-bold text-zinc-900 uppercase tracking-wider text-[10px] text-zinc-400">
                Ordered Items
              </p>
              {completedOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center text-zinc-800">
                  <span>
                    <span className="font-bold font-mono text-zinc-950">{it.quantity}x</span> {it.name}
                  </span>
                  <span className="font-mono font-semibold">
                    ${(it.price * it.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-zinc-200 flex justify-between items-center font-bold text-zinc-950">
                <span>Total Paid</span>
                <span className="font-mono text-sm">${completedOrder.total_amount.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              Back to My Wallet Pass
            </button>
          </div>
        ) : (
          /* Order Placement View */
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Company Selection Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                1. Select Company / Store
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {companies.map((comp) => {
                  const Icon = getCompanyIcon(comp.category);
                  const isSelected = comp.id === selectedCompanyId;
                  return (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => setSelectedCompanyId(comp.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-2xl border text-left transition ${
                        isSelected
                          ? 'border-zinc-950 bg-zinc-950 text-white shadow-xs font-bold'
                          : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs truncate font-semibold">{comp.name}</p>
                        <p className={`text-[10px] truncate ${isSelected ? 'text-zinc-300' : 'text-zinc-400'}`}>
                          {comp.category || 'Store'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Menu Catalog */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  2. Select Items from {selectedCompany?.name}
                </label>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {products.length} items available
                </span>
              </div>

              <div className="space-y-2">
                {products.map((prod) => {
                  const qty = cart[prod.id] || 0;
                  return (
                    <div
                      key={prod.id}
                      className="p-3 bg-white rounded-2xl border border-zinc-200 flex items-center justify-between gap-3 hover:border-zinc-300 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-zinc-900 truncate">{prod.name}</h4>
                          {prod.popular && (
                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 truncate mt-0.5">{prod.description}</p>
                        <p className="text-xs font-extrabold font-mono text-zinc-900 mt-1">
                          ${prod.price.toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity stepper */}
                      <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => updateQuantity(prod.id, -1)}
                          disabled={qty === 0}
                          className="w-6 h-6 rounded-lg bg-white text-zinc-800 flex items-center justify-center font-bold text-xs disabled:opacity-30 shadow-2xs hover:bg-zinc-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-mono font-bold text-zinc-900">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(prod.id, 1)}
                          className="w-6 h-6 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold text-xs shadow-2xs hover:bg-zinc-800"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pickup Preference */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                3. Pickup Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'in_store', label: 'In-Store Pickup' },
                    { id: 'curbside', label: 'Curbside' },
                    { id: 'dine_in', label: 'Dine-In' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPickupType(opt.id)}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-semibold border transition ${
                      pickupType === opt.id
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                4. Special Instructions (Optional)
              </label>
              <input
                type="text"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Extra hot, table #5, or vehicle plate..."
                className="w-full text-xs px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950"
              />
            </div>
          </div>
        )}

        {/* Modal Footer / Cart Bar */}
        {!completedOrder && (
          <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase font-bold text-zinc-400">Order Total</p>
              <p className="text-lg font-black font-mono text-zinc-900">
                ${totalAmount.toFixed(2)}
                <span className="text-[11px] font-normal text-zinc-500 font-sans ml-1">
                  ({totalCount} {totalCount === 1 ? 'item' : 'items'})
                </span>
              </p>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={cartItems.length === 0 || submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 disabled:opacity-40 text-white font-bold text-xs shadow-md transition"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Place Order (+1 Stamp)
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
