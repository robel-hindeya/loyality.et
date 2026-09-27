'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { orderService } from '@/services/order.service';
import { fallbackStorage } from '@/lib/fallback-storage';
import { CompanyOrder, Company } from '@/types';
import { OrderFlowModal } from '@/components/orders/OrderFlowModal';
import {
  ShoppingBag,
  Plus,
  ArrowLeft,
  Clock,
  Store,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Building2,
  Car,
  ChevronRight,
  Receipt,
  Sparkles,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function UserOrdersPage() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<CompanyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>(undefined);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const currentProfile =
    profile || fallbackStorage.getCurrentUser() || fallbackStorage.getUsers().find((u) => u.role === 'user');
  const userId = currentProfile?.id || 'usr-customer-001';

  const loadOrders = async () => {
    try {
      setLoading(true);
      const userOrders = await orderService.getUserOrders(userId);
      setOrders(userOrders);
    } catch (err) {
      console.error('Failed to load user orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [userId]);

  const companies = fallbackStorage.getCompanies();

  const getCompanyIcon = (cat?: string | null) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('coffee') || c.includes('cafe')) return Coffee;
    if (c.includes('hotel') || c.includes('hospitality')) return Building2;
    if (c.includes('car') || c.includes('wash') || c.includes('auto')) return Car;
    return Store;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
            <CheckCircle2 className="w-3 h-3" /> Ready for Pickup
          </span>
        );
      case 'preparing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3" /> Preparing
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> Order Placed
          </span>
        );
    }
  };

  const filteredOrders =
    activeFilter === 'all'
      ? orders
      : orders.filter((o) => o.company_id === activeFilter);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#fafafa] pb-24 md:pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/user"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-950 transition mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Wallet Pass
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-zinc-950" />
              Company Orders
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
              Live orders, pickup status, and loyalty stamp rewards.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setSelectedCompanyId(undefined);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              New Company Order
            </button>
          </div>
        </div>

        {/* Company Quick-Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeFilter === 'all'
                ? 'bg-zinc-950 text-white font-bold shadow-xs'
                : 'bg-white text-zinc-600 hover:text-zinc-950 border border-zinc-200'
            }`}
          >
            All Companies ({orders.length})
          </button>
          {companies.map((comp) => {
            const Icon = getCompanyIcon(comp.category);
            const count = orders.filter((o) => o.company_id === comp.id).length;
            const isSelected = activeFilter === comp.id;
            return (
              <button
                key={comp.id}
                onClick={() => setActiveFilter(comp.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-zinc-950 text-white border-zinc-950 font-bold shadow-xs'
                    : 'bg-white text-zinc-600 hover:text-zinc-950 border-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{comp.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20' : 'bg-zinc-100'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-950" />
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-10 border border-zinc-200 text-center shadow-xs space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 text-zinc-600 flex items-center justify-center mx-auto border border-zinc-200">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-950">No orders placed yet</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                Order from your favorite companies (Café, Hotel, Car Wash) to automatically collect loyalty stamps!
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" /> Place First Order
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const Icon = getCompanyIcon(order.company?.category);
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200 shadow-minimal hover:border-zinc-300 transition space-y-4"
                >
                  {/* Top: Company, Status, Order # */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-3 border-b border-zinc-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 shadow-2xs">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-zinc-900 text-sm">
                            {order.company?.name || 'Store'}
                          </h3>
                          <span className="text-[11px] font-mono font-bold text-zinc-400">
                            {order.order_number}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          {formatDate(order.created_at)} • Pickup: {order.pickup_type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="bg-zinc-50/70 rounded-2xl p-3.5 space-y-1.5 border border-zinc-100">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs text-zinc-700"
                      >
                        <span>
                          <span className="font-mono font-bold text-zinc-950">{item.quantity}x</span>{' '}
                          {item.name}
                        </span>
                        <span className="font-mono font-semibold text-zinc-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {order.special_instructions && (
                      <p className="text-[11px] text-zinc-400 italic pt-1 border-t border-zinc-200/60 mt-1">
                        Note: &ldquo;{order.special_instructions}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Bottom: Stamp Award & Total */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>+{order.stamps_earned} Stamp Earned</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] text-zinc-400 uppercase font-semibold">Total</p>
                        <p className="text-base font-black font-mono text-zinc-950">
                          ${order.total_amount.toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCompanyId(order.company_id);
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-semibold transition"
                      >
                        Order Again
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Order Flow Modal */}
      <OrderFlowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialCompanyId={selectedCompanyId}
        userId={userId}
        onOrderCompleted={() => loadOrders()}
      />
    </div>
  );
}
