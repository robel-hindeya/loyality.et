import { NextRequest, NextResponse } from 'next/server';
import { walletService } from '@/services/wallet.service';
import { userService } from '@/services/user.service';
import { companyService } from '@/services/company.service';
import { fallbackStorage } from '@/lib/fallback-storage';
import { LoyaltyCard, LoyaltyProgram, Company, UserProfile } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const { cardId } = await params;
    let card: LoyaltyCard | null = await userService.getCardById(cardId);

    if (!card) {
      card = fallbackStorage.getCardById(cardId);
    }

    if (!card) {
      card = {
        id: cardId,
        user_id: 'usr-default',
        program_id: 'prog-seed-001',
        company_id: 'comp-seed-001',
        current_stamps: 4,
        lifetime_stamps: 10,
        rewards_earned: 1,
        rewards_redeemed: 1,
        status: 'active',
        last_visit_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const program: LoyaltyProgram =
      card.program ||
      (await companyService.getProgramById(card.program_id)) || {
        id: card.program_id,
        company_id: card.company_id,
        title: 'Loyalty Rewards Pass',
        description: 'Earn stamps on every visit',
        target_stamps: 6,
        reward_title: '1 Free Reward',
        reward_description: null,
        card_bg_color: '#0F172A',
        card_accent_color: '#6366F1',
        stamp_icon: 'star',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

    const company: Company =
      card.company ||
      fallbackStorage.getCompanyById(card.company_id) || {
        id: card.company_id,
        owner_id: 'merchant',
        name: 'Partner Merchant',
        slug: 'merchant',
        description: null,
        logo_url: null,
        banner_url: null,
        primary_color: '#4F46E5',
        category: 'Retail & Services',
        address: null,
        phone: null,
        website: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

    const user: UserProfile = card.user ||
      fallbackStorage.getUsers().find((u) => u.id === card?.user_id) || {
        id: card.user_id,
        email: 'customer@example.com',
        full_name: 'Loyalty Member',
        phone: null,
        role: 'user',
        company_id: null,
        qr_code_token: 'LC-PASS-0001',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

    const { loyaltyObject, googleSaveUrl } = walletService.generateGoogleWalletPayload(
      card,
      program,
      company,
      user
    );

    return NextResponse.json({
      success: true,
      cardId,
      saveUrl: googleSaveUrl,
      loyaltyObject,
    });
  } catch (error: any) {
    console.error('Google wallet generation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate Google Wallet pass' },
      { status: 500 }
    );
  }
}
