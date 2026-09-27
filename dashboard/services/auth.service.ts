import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { fallbackStorage } from '@/lib/fallback-storage';
import { UserProfile, UserRole } from '@/types';
import { generateQrToken } from '@/lib/utils';

export const authService = {
  /**
   * Log in user with email and password
   */
  async signIn(email: string, pass: string) {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });

        if (!error && data?.user) {
          // Fetch user profile from Supabase
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const userProfile = (profile as UserProfile) || {
            id: data.user.id,
            email: data.user.email || email,
            full_name: data.user.user_metadata?.full_name || 'User',
            phone: data.user.user_metadata?.phone || null,
            role: (data.user.user_metadata?.role as UserRole) || 'user',
            company_id: data.user.user_metadata?.company_id || null,
            qr_code_token: data.user.user_metadata?.qr_code_token || 'LC-USER-0001',
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          fallbackStorage.setCurrentUser(userProfile);
          return { session: data.session, user: data.user, profile: userProfile };
        }
      } catch (err: any) {
        console.warn('Supabase signIn network error, falling back to local store:', err?.message);
      }
    }

    // Fallback store login
    const profile = fallbackStorage.loginUser(email, pass);
    return { session: null, user: { id: profile.id, email: profile.email }, profile };
  },

  /**
   * Sign up a new user or company owner
   */
  async signUp(params: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    phone?: string;
    companyName?: string;
    companyCategory?: string;
  }) {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const qrToken = generateQrToken();

        // 1. Sign up user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: params.email,
          password: params.password,
          options: {
            data: {
              full_name: params.fullName,
              role: params.role,
              phone: params.phone || '',
              qr_code_token: qrToken,
            },
          },
        });

        if (!error && data?.user) {
          // 2. Insert into profiles table
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: params.email,
            full_name: params.fullName,
            phone: params.phone || null,
            role: params.role,
            qr_code_token: qrToken,
            avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(params.fullName)}`,
          });

          // 3. Company creation if role === 'company'
          if (params.role === 'company' && params.companyName) {
            const slug =
              params.companyName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '') +
              '-' +
              Math.floor(1000 + Math.random() * 9000);

            const { data: companyData } = await supabase
              .from('companies')
              .insert({
                owner_id: data.user.id,
                name: params.companyName,
                slug,
                category: params.companyCategory || 'Retail & Services',
                primary_color: '#4F46E5',
                description: `Welcome to ${params.companyName} loyalty rewards.`,
              })
              .select()
              .single();

            if (companyData) {
              await supabase
                .from('profiles')
                .update({ company_id: companyData.id })
                .eq('id', data.user.id);

              await supabase.from('loyalty_programs').insert({
                company_id: companyData.id,
                title: 'Buy 6 Services, Get 1 Free',
                description: 'Visit 6 times and receive a complimentary special reward on us!',
                target_stamps: 6,
                reward_title: '1 Free Product / Service',
                reward_description: 'Redeemable at counter upon reaching 6 stamps.',
                card_bg_color: '#0F172A',
                card_accent_color: '#6366F1',
                stamp_icon: 'star',
                is_active: true,
              });
            }
          }

          const profile: UserProfile = {
            id: data.user.id,
            email: params.email,
            full_name: params.fullName,
            phone: params.phone || null,
            role: params.role,
            company_id: null,
            qr_code_token: qrToken,
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          fallbackStorage.setCurrentUser(profile);
          return data;
        }
      } catch (err: any) {
        console.warn('Supabase signUp network error, seamlessly using fallback store:', err?.message);
      }
    }

    // Seamless Fallback Storage Registration
    const result = fallbackStorage.registerUser(params);
    return { user: { id: result.user.id, email: result.user.email }, session: null };
  },

  /**
   * Sign out current user
   */
  async signOut() {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut notice:', e);
      }
    }
    fallbackStorage.setCurrentUser(null);
  },

  /**
   * Get current authenticated user profile
   */
  async getCurrentProfile(): Promise<UserProfile | null> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile) {
            fallbackStorage.setCurrentUser(profile as UserProfile);
            return profile as UserProfile;
          }
        }
      } catch (e) {
        console.warn('Supabase getProfile network error, checking fallback store:', e);
      }
    }

    return fallbackStorage.getCurrentUser();
  },
};
