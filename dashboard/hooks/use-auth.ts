'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { fallbackStorage } from '@/lib/fallback-storage';
import { UserProfile, UserRole } from '@/types';
import { authService } from '@/services/auth.service';

export function useAuth() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const currentProfile = await authService.getCurrentProfile();
        if (isMounted) {
          if (currentProfile) {
            setProfile(currentProfile);
          } else {
            // Check fallback storage
            const localUser = fallbackStorage.getCurrentUser();
            setProfile(localUser);
          }
        }
      } catch (err) {
        console.warn('Error retrieving current profile:', err);
        if (isMounted) {
          setProfile(fallbackStorage.getCurrentUser());
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            const currentProfile = await authService.getCurrentProfile();
            if (isMounted) setProfile(currentProfile);
          } else {
            if (isMounted) setProfile(fallbackStorage.getCurrentUser());
          }
          if (isMounted) setLoading(false);
        });

        return () => {
          isMounted = false;
          subscription.unsubscribe();
        };
      } catch (e) {
        console.warn('Supabase auth listener setup note:', e);
      }
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const signOut = async () => {
    try {
      await authService.signOut();
      setProfile(null);
      router.push('/login');
    } catch (err) {
      console.error('Error during sign out:', err);
    }
  };

  const switchRole = (newRole: UserRole) => {
    let targetUser: UserProfile | null = null;
    const users = fallbackStorage.getUsers();
    targetUser = users.find((u) => u.role === newRole) || null;

    if (!targetUser) {
      if (newRole === 'company') {
        targetUser = fallbackStorage.registerUser({
          email: 'merchant@artisanroast.com',
          password: 'password123',
          fullName: 'Alex Vance (Store Owner)',
          role: 'company',
          companyName: 'Artisan Roast & Café',
          companyCategory: 'Coffee Shop & Bakery',
        }).user;
      } else if (newRole === 'cashier') {
        const comps = fallbackStorage.getCompanies();
        targetUser = fallbackStorage.createCashier(
          comps[0].id,
          'Sarah Miller (Cashier)',
          'cashier@artisanroast.com',
          'password123'
        );
      } else {
        targetUser = fallbackStorage.registerUser({
          email: 'jordan@customer.com',
          password: 'password123',
          fullName: 'Jordan Taylor',
          role: 'user',
        }).user;
      }
    }

    fallbackStorage.setCurrentUser(targetUser);
    setProfile(targetUser);

    if (newRole === 'company') router.push('/dashboard/company');
    else if (newRole === 'cashier') router.push('/dashboard/cashier');
    else router.push('/dashboard/user');
  };

  return {
    profile,
    user: profile,
    loading,
    role: profile?.role,
    isAuthenticated: Boolean(profile),
    signOut,
    switchRole,
  };
}
