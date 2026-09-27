'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  Sparkles,
  QrCode,
  LayoutDashboard,
  Gift,
  Users,
  BarChart3,
  LogOut,
  CreditCard,
  Building2,
  Store,
  ChevronDown,
  Clock,
  User,
  ArrowRight,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';

export function Navbar() {
  const { profile, role, signOut, isAuthenticated } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isUserAuthenticated = mounted && isAuthenticated;

  // Active section detection
  const isUserRoute = pathname.startsWith('/user');
  const isCompanyRoute = pathname.startsWith('/company') || pathname.startsWith('/campany');
  const isCashierRoute = pathname.startsWith('/cashier');

  // Sub-navigation links based on current section
  const getSubNavLinks = () => {
    if (isCompanyRoute) {
      return [
        { href: '/company', label: 'Overview', icon: LayoutDashboard },
        { href: '/company/programs', label: 'Programs', icon: Gift },
        { href: '/company/cashiers', label: 'Staff', icon: Users },
        { href: '/company/customers', label: 'Customers', icon: Store },
        { href: '/company/analytics', label: 'Analytics', icon: BarChart3 },
      ];
    }
    if (isCashierRoute) {
      return [
        { href: '/cashier', label: 'Terminal Scanner', icon: QrCode },
        { href: '/cashier/history', label: 'Scan History', icon: Clock },
      ];
    }
    // Customer pass routes keep top navbar clean (Orders is in bottom mobile nav, Available & Stamp Activate removed)
    return [];
  };

  const subNavLinks = getSubNavLinks();

  return (
    <>
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
            {/* Left: Logo */}
            <div className="flex items-center gap-6 sm:gap-8 flex-shrink-0">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-zinc-950 text-white border border-zinc-800 flex items-center justify-center shadow-sm group-hover:scale-105 transition">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <div>
                  <span className="text-base sm:text-lg font-bold text-zinc-950 tracking-tight flex items-center gap-1.5">
                    LoyaltyPass
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
                      PRO
                    </span>
                  </span>
                </div>
              </Link>

              {/* Main Desktop Page Switcher: Always visible so user can see all 3 pages */}
              <div className="hidden lg:flex items-center bg-zinc-100 p-1 rounded-2xl border border-zinc-200/80">
                <Link
                  href="/user"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isUserRoute
                      ? 'bg-white text-zinc-950 shadow-sm font-bold'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  <CreditCard className={`w-3.5 h-3.5 ${isUserRoute ? 'text-zinc-950' : 'text-zinc-400'}`} />
                  Member Pass
                </Link>
                <Link
                  href="/company"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isCompanyRoute
                      ? 'bg-white text-zinc-950 shadow-sm font-bold'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  <Building2 className={`w-3.5 h-3.5 ${isCompanyRoute ? 'text-zinc-950' : 'text-zinc-400'}`} />
                  Company Portal
                </Link>
                <Link
                  href="/cashier"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isCashierRoute
                      ? 'bg-white text-zinc-950 shadow-sm font-bold'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  <QrCode className={`w-3.5 h-3.5 ${isCashierRoute ? 'text-zinc-950' : 'text-zinc-400'}`} />
                  Cashier Scanner
                </Link>
              </div>
            </div>

            {/* Middle: Compact Switcher on Medium screens */}
            <div className="hidden md:flex lg:hidden items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
              <Link
                href="/user"
                title="Member Pass"
                className={`p-1.5 rounded-lg text-xs font-bold transition ${
                  isUserRoute ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                Pass
              </Link>
              <Link
                href="/company"
                title="Company Portal"
                className={`p-1.5 rounded-lg text-xs font-bold transition ${
                  isCompanyRoute ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                Company
              </Link>
              <Link
                href="/cashier"
                title="Cashier Scanner"
                className={`p-1.5 rounded-lg text-xs font-bold transition ${
                  isCashierRoute ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                Cashier
              </Link>
            </div>

            {/* Desktop Right Header: Auth / Profile Dropdown / Switcher */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Quick Jump Dropdown for easy switching to any page */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-800 transition shadow-2xs"
                >
                  {isUserRoute ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Member Pass
                    </span>
                  ) : isCompanyRoute ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                      Company
                    </span>
                  ) : isCashierRoute ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      Cashier
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
                      Explore Pages
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    onMouseLeave={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-zinc-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-4 py-2 border-b border-zinc-100">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Jump to Any Page
                      </p>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <Link
                        href="/user"
                        onClick={() => setUserDropdownOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition ${
                          pathname === '/user'
                            ? 'bg-zinc-950 text-white font-bold'
                            : 'text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 flex-shrink-0" />
                        <div>
                          <p className="font-semibold leading-tight">Member Pass (/user)</p>
                          <p className={`text-[10px] ${pathname === '/user' ? 'text-zinc-300' : 'text-zinc-400'}`}>
                            Customer cards & QR pass
                          </p>
                        </div>
                      </Link>

                      <Link
                        href="/user/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition ${
                          pathname.startsWith('/user/orders')
                            ? 'bg-zinc-950 text-white font-bold'
                            : 'text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        <ShoppingBag className="w-4 h-4 flex-shrink-0" />
                        <div>
                          <p className="font-semibold leading-tight">Company Orders (/user/orders)</p>
                          <p className={`text-[10px] ${pathname.startsWith('/user/orders') ? 'text-zinc-300' : 'text-zinc-400'}`}>
                            Live pickup orders & receipts
                          </p>
                        </div>
                      </Link>

                      <Link
                        href="/company"
                        onClick={() => setUserDropdownOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition ${
                          isCompanyRoute
                            ? 'bg-zinc-950 text-white font-bold'
                            : 'text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        <Building2 className="w-4 h-4 flex-shrink-0" />
                        <div>
                          <p className="font-semibold leading-tight">Company Portal (/company)</p>
                          <p className={`text-[10px] ${isCompanyRoute ? 'text-zinc-300' : 'text-zinc-400'}`}>
                            Programs, staff & analytics
                          </p>
                        </div>
                      </Link>

                      <Link
                        href="/cashier"
                        onClick={() => setUserDropdownOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition ${
                          isCashierRoute
                            ? 'bg-zinc-950 text-white font-bold'
                            : 'text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        <QrCode className="w-4 h-4 flex-shrink-0" />
                        <div>
                          <p className="font-semibold leading-tight">Cashier Scanner (/cashier)</p>
                          <p className={`text-[10px] ${isCashierRoute ? 'text-zinc-300' : 'text-zinc-400'}`}>
                            Scan QR & approve stamps
                          </p>
                        </div>
                      </Link>
                    </div>

                    {isUserAuthenticated && (
                      <div className="pt-2 border-t border-zinc-100 px-1 mt-1">
                        <div className="px-3 py-1">
                          <p className="text-xs font-semibold text-zinc-900 truncate">
                            {profile?.full_name || 'My Account'}
                          </p>
                          <p className="text-[11px] text-zinc-400 truncate">{profile?.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            signOut();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium rounded-xl transition mt-1"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Login / Register buttons if guest */}
              {!isUserAuthenticated && (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 px-3 py-1.5 rounded-xl hover:bg-zinc-100 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 px-3 py-1.5 rounded-xl shadow-xs transition"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sub-navigation bar: shown when inside section with sub-routes */}
        {subNavLinks.length > 0 && (
          <div className="hidden md:block border-t border-zinc-100 bg-zinc-50/60 backdrop-blur-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-1 py-1.5 overflow-x-auto no-scrollbar">
                {subNavLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition ${
                        isActive
                          ? 'bg-zinc-900 text-white font-semibold shadow-2xs'
                          : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Navigation Bar: Clean Native Mobile App Style */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-zinc-200/90 px-2 py-1 shadow-lg pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Link
            href="/user"
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
              pathname === '/user'
                ? 'text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-zinc-700 font-medium'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition ${
                pathname === '/user' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-500'
              }`}
            >
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Pass</span>
          </Link>

          <Link
            href="/user/orders"
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
              pathname.startsWith('/user/orders')
                ? 'text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-zinc-700 font-medium'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition ${
                pathname.startsWith('/user/orders') ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-500'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Orders</span>
          </Link>

          <Link
            href="/company"
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
              isCompanyRoute
                ? 'text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-zinc-700 font-medium'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition ${
                isCompanyRoute ? 'bg-indigo-600 text-white shadow-xs' : 'text-zinc-500'
              }`}
            >
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Company</span>
          </Link>

          <Link
            href="/cashier"
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
              isCashierRoute
                ? 'text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-zinc-700 font-medium'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition ${
                isCashierRoute ? 'bg-amber-600 text-white shadow-xs' : 'text-zinc-500'
              }`}
            >
              <QrCode className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Cashier</span>
          </Link>
        </div>
      </div>
    </>
  );
}
