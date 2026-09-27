'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { UserRole } from '@/types';
import {
  Sparkles,
  Building2,
  CreditCard,
  Mail,
  Lock,
  User,
  Phone,
  Store,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get('role') as UserRole) || 'company';

  const [role, setRole] = useState<UserRole>(
    initialRole === 'company' || initialRole === 'user' ? initialRole : 'company'
  );
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyCategory, setCompanyCategory] = useState('Coffee Shop & Bakery');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      await authService.signUp({
        email,
        password,
        fullName,
        role,
        phone,
        companyName: role === 'company' ? companyName : undefined,
        companyCategory: role === 'company' ? companyCategory : undefined,
      });

      // Redirect immediately to respective dashboard
      if (role === 'company') {
        router.push('/company');
      } else {
        router.push('/user');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMessage(err?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-minimal-md border border-zinc-200">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex w-11 h-11 rounded-xl bg-zinc-950 text-white items-center justify-center border border-zinc-800 shadow-sm mb-3">
          <Sparkles className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Create Account</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Choose your account type to get started
        </p>
      </div>

      {/* Role Toggle Selector */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-100 rounded-xl mb-6 border border-zinc-200/80">
        <button
          type="button"
          onClick={() => setRole('company')}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
            role === 'company'
              ? 'bg-zinc-950 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Building2 className="w-4 h-4" /> Company / Merchant
        </button>
        <button
          type="button"
          onClick={() => setRole('user')}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
            role === 'user'
              ? 'bg-zinc-950 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Customer Member
        </button>
      </div>

      {errorMessage && (
        <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-3.5">
        {/* Company Specific Fields */}
        {role === 'company' && (
          <>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Company / Store Name *
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Blue Bottle Coffee"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/70 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Business Category
              </label>
              <select
                value={companyCategory}
                onChange={(e) => setCompanyCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-zinc-50/70 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition"
              >
                <option value="Coffee Shop & Bakery">Coffee Shop & Bakery</option>
                <option value="Salon, Spa & Beauty">Salon, Spa & Beauty</option>
                <option value="Restaurant & Bar">Restaurant & Bar</option>
                <option value="Car Wash & Auto Detailing">Car Wash & Auto Detailing</option>
                <option value="Fitness & Yoga Studio">Fitness & Yoga Studio</option>
                <option value="Retail & Boutique">Retail & Boutique</option>
                <option value="Pet Care & Grooming">Pet Care & Grooming</option>
                <option value="Other Services">Other Services</option>
              </select>
            </div>
          </>
        )}

        {/* Full Name */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1">
            {role === 'company' ? 'Owner / Manager Name *' : 'Your Full Name *'}
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/70 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/70 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1">
            Phone Number (Optional)
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/70 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1">
            Password (min. 6 characters) *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/70 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 py-3 px-4 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white font-medium rounded-xl text-sm shadow-sm transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Setting up account...
            </>
          ) : (
            <>
              Create {role === 'company' ? 'Company Account' : 'Customer Account'}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-zinc-100 text-center">
        <p className="text-xs text-zinc-500">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-zinc-900 hover:text-zinc-700 underline underline-offset-2 transition"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 bg-[#fafafa]">
      <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-400">Loading registration...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
