import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { fallbackStorage } from '@/lib/fallback-storage';
import { UserProfile, LoyaltyCard, LoyaltyProgram, StampLog, RewardRedemption } from '@/types';
import { generateRedemptionCode } from '@/lib/utils';

export const cashierService = {
  /**
   * Look up a customer profile and their company loyalty card by scanning their QR code token
   */
  async verifyCustomerByQrToken(qrToken: string, companyId: string) {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const cleanToken = qrToken.trim().toUpperCase();

        const { data: customer, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('qr_code_token', cleanToken)
          .maybeSingle();

        if (customer) {
          const { data: programs } = await supabase
            .from('loyalty_programs')
            .select('*')
            .eq('company_id', companyId)
            .eq('is_active', true);

          if (programs && programs.length > 0) {
            const defaultProgram = programs[0] as LoyaltyProgram;
            let { data: card } = await supabase
              .from('loyalty_cards')
              .select('*, program:loyalty_programs(*)')
              .eq('user_id', customer.id)
              .eq('program_id', defaultProgram.id)
              .maybeSingle();

            if (!card) {
              const { data: newCard } = await supabase
                .from('loyalty_cards')
                .insert({
                  user_id: customer.id,
                  program_id: defaultProgram.id,
                  company_id: companyId,
                  current_stamps: 0,
                  lifetime_stamps: 0,
                  rewards_earned: 0,
                  rewards_redeemed: 0,
                  status: 'active',
                })
                .select('*, program:loyalty_programs(*)')
                .single();
              card = newCard;
            }

            if (card) {
              const currentCard = card as LoyaltyCard & { program: LoyaltyProgram };
              const target = currentCard.program?.target_stamps || defaultProgram.target_stamps || 6;
              const isReadyForReward = currentCard.current_stamps >= target || currentCard.status === 'reward_ready';

              return {
                customer: customer as UserProfile,
                card: currentCard,
                program: currentCard.program || defaultProgram,
                canRedeem: isReadyForReward,
                progressPercentage: Math.min(100, Math.round((currentCard.current_stamps / target) * 100)),
              };
            }
          }
        }
      } catch (err) {
        console.warn('Supabase verifyCustomerByQrToken note:', err);
      }
    }

    // Fallback store verification
    return fallbackStorage.verifyCustomerByQr(qrToken, companyId);
  },

  /**
   * Cashier adds +1 visit / stamp to customer card
   */
  async addVisitStamp(params: {
    cardId: string;
    userId: string;
    companyId: string;
    programId: string;
    cashierId?: string | null;
    notes?: string;
    stampsToAdd?: number;
  }) {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const stampsToAdd = params.stampsToAdd || 1;

        const { data: card } = await supabase
          .from('loyalty_cards')
          .select('*, program:loyalty_programs(*)')
          .eq('id', params.cardId)
          .single();

        if (card) {
          const program = card.program as LoyaltyProgram;
          const target = program?.target_stamps || 6;
          const newCurrentStamps = card.current_stamps + stampsToAdd;
          const newLifetimeStamps = card.lifetime_stamps + stampsToAdd;
          const rewardUnlocked = newCurrentStamps >= target;
          const newRewardsEarned = rewardUnlocked ? card.rewards_earned + 1 : card.rewards_earned;
          const newStatus = rewardUnlocked ? 'reward_ready' : 'active';

          const { data: updatedCard } = await supabase
            .from('loyalty_cards')
            .update({
              current_stamps: newCurrentStamps,
              lifetime_stamps: newLifetimeStamps,
              rewards_earned: newRewardsEarned,
              status: newStatus,
              last_visit_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', params.cardId)
            .select('*, program:loyalty_programs(*)')
            .single();

          await supabase.from('stamp_logs').insert({
            card_id: params.cardId,
            user_id: params.userId,
            cashier_id: params.cashierId || null,
            company_id: params.companyId,
            program_id: params.programId,
            stamps_added: stampsToAdd,
            notes: params.notes || `Visit stamped by counter staff`,
          });

          if (updatedCard) {
            return {
              card: updatedCard as LoyaltyCard & { program: LoyaltyProgram },
              rewardUnlocked,
              newStamps: newCurrentStamps,
              targetStamps: target,
            };
          }
        }
      } catch (err) {
        console.warn('Supabase addVisitStamp note:', err);
      }
    }

    return fallbackStorage.addVisitStamp(params);
  },

  /**
   * Cashier redeems a reward for the customer
   */
  async redeemCustomerReward(params: {
    cardId: string;
    userId: string;
    companyId: string;
    programId: string;
    cashierId?: string | null;
    rewardTitle: string;
  }) {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: card } = await supabase
          .from('loyalty_cards')
          .select('*, program:loyalty_programs(*)')
          .eq('id', params.cardId)
          .single();

        if (card) {
          const program = card.program as LoyaltyProgram;
          const target = program?.target_stamps || 6;
          const newCurrentStamps = Math.max(0, card.current_stamps - target);
          const newStatus = newCurrentStamps >= target ? 'reward_ready' : 'active';
          const redemptionCode = generateRedemptionCode();

          const { data: updatedCard } = await supabase
            .from('loyalty_cards')
            .update({
              current_stamps: newCurrentStamps,
              rewards_redeemed: (card.rewards_redeemed || 0) + 1,
              status: newStatus,
              updated_at: new Date().toISOString(),
            })
            .eq('id', params.cardId)
            .select('*, program:loyalty_programs(*)')
            .single();

          const { data: redemption } = await supabase
            .from('reward_redemptions')
            .insert({
              card_id: params.cardId,
              user_id: params.userId,
              cashier_id: params.cashierId || null,
              company_id: params.companyId,
              program_id: params.programId,
              reward_title: params.rewardTitle,
              redemption_code: redemptionCode,
              stamps_spent: target,
            })
            .select()
            .single();

          if (updatedCard && redemption) {
            return {
              card: updatedCard as LoyaltyCard & { program: LoyaltyProgram },
              redemption: redemption as RewardRedemption,
              redemptionCode,
            };
          }
        }
      } catch (err) {
        console.warn('Supabase redeemCustomerReward note:', err);
      }
    }

    return fallbackStorage.redeemReward(params);
  },

  /**
   * Get recent stamp logs and scans processed by this cashier or company
   */
  async getRecentActivity(companyId: string, cashierId?: string): Promise<StampLog[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase
          .from('stamp_logs')
          .select('*, user:profiles(*), program:loyalty_programs(*), cashier:profiles!stamp_logs_cashier_id_fkey(*)')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (cashierId) {
          query = query.eq('cashier_id', cashierId);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data as StampLog[];
        }
      } catch (err) {
        console.warn('Supabase getRecentActivity note:', err);
      }
    }

    return fallbackStorage.getStampLogs(undefined, companyId);
  },
};
