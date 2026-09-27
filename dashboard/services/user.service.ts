import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { fallbackStorage } from '@/lib/fallback-storage';
import { LoyaltyCard, StampLog, RewardRedemption, LoyaltyProgram } from '@/types';

export const userService = {
  /**
   * Get all active loyalty cards belonging to a customer
   */
  async getUserCards(userId: string): Promise<LoyaltyCard[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('loyalty_cards')
          .select('*, program:loyalty_programs(*), company:companies(*)')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as LoyaltyCard[];
        }
      } catch (err) {
        console.warn('Supabase getUserCards note:', err);
      }
    }

    return fallbackStorage.getUserCards(userId);
  },

  /**
   * Get specific card details
   */
  async getCardById(cardId: string, userId?: string): Promise<LoyaltyCard | null> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase
          .from('loyalty_cards')
          .select('*, program:loyalty_programs(*), company:companies(*)')
          .eq('id', cardId);

        if (userId) query = query.eq('user_id', userId);

        const { data } = await query.maybeSingle();
        if (data) return data as LoyaltyCard;
      } catch (err) {
        console.warn('Supabase getCardById note:', err);
      }
    }

    return fallbackStorage.getCardById(cardId);
  },

  /**
   * Get customer's visit and stamp history
   */
  async getUserStampLogs(userId: string): Promise<StampLog[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('stamp_logs')
          .select('*, program:loyalty_programs(title), company:companies(name, logo_url)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (data && data.length > 0) return data as StampLog[];
      } catch (err) {
        console.warn('Supabase getUserStampLogs note:', err);
      }
    }

    return fallbackStorage.getStampLogs(userId);
  },

  /**
   * Get customer's reward redemptions history
   */
  async getUserRedemptions(userId: string): Promise<RewardRedemption[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('reward_redemptions')
          .select('*, program:loyalty_programs(title), company:companies(name, logo_url)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (data && data.length > 0) return data as RewardRedemption[];
      } catch (err) {
        console.warn('Supabase getUserRedemptions note:', err);
      }
    }

    return fallbackStorage.getRedemptions(userId);
  },

  /**
   * Discover other available company loyalty programs that user can join
   */
  async getDiscoverablePrograms(userId: string): Promise<LoyaltyProgram[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: userCards } = await supabase
          .from('loyalty_cards')
          .select('program_id')
          .eq('user_id', userId);

        const enrolledProgramIds = (userCards || []).map((c) => c.program_id);

        let query = supabase
          .from('loyalty_programs')
          .select('*, company:companies(*)')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (enrolledProgramIds.length > 0) {
          query = query.not('id', 'in', `(${enrolledProgramIds.join(',')})`);
        }

        const { data } = await query;
        if (data) return data as LoyaltyProgram[];
      } catch (err) {
        console.warn('Supabase getDiscoverablePrograms note:', err);
      }
    }

    const cards = fallbackStorage.getUserCards(userId);
    const enrolledIds = cards.map((c) => c.program_id);
    return fallbackStorage.getPrograms().filter((p) => !enrolledIds.includes(p.id));
  },

  /**
   * Join/Enroll into a loyalty program
   */
  async enrollInProgram(userId: string, programId: string, companyId: string): Promise<LoyaltyCard> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('loyalty_cards')
          .upsert({
            user_id: userId,
            program_id: programId,
            company_id: companyId,
            current_stamps: 0,
            lifetime_stamps: 0,
            rewards_earned: 0,
            rewards_redeemed: 0,
            status: 'active',
          })
          .select('*, program:loyalty_programs(*), company:companies(*)')
          .single();

        if (!error && data) return data as LoyaltyCard;
      } catch (err) {
        console.warn('Supabase enrollInProgram note:', err);
      }
    }

    return fallbackStorage.enrollInProgram(userId, programId, companyId);
  },
};
