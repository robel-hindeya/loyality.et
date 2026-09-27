'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const { profile } = await authService.signIn(email, password);

      // Redirect user to destination or role dashboard
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (profile?.role === 'company') {
        router.push('/company');
      } else if (profile?.role === 'cashier') {
        router.push('/cashier');
      } else {
        router.push('/user');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setErrorMessage(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-minimal-md border border-zinc-200">
      {/* Brand header */}
      <div className="text-center mb-8">
        <div className="inline-flex w-11 h-11 rounded-xl bg-zinc-950 text-white items-center justify-center border border-zinc-800 shadow-sm mb-3">
          <Sparkles className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Welcome Back</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Sign in to access your LoyaltyPass account
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@business.com"
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/70 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-zinc-700">
              Password
            </label>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
            <input
              type="password"
              required
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
          className="w-full mt-2 py-3 px-4 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white font-medium rounded-xl text-sm shadow-sm transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
        <p className="text-xs text-zinc-500">
          Don&apos;t have an account yet?{' '}
          <Link
            href="/register"
            className="font-semibold text-zinc-900 hover:text-zinc-700 underline underline-offset-2 transition"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 bg-[#fafafa]">
      <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-400">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
