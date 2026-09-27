import { NextRequest, NextResponse } from 'next/server';
import { cashierService } from '@/services/cashier.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardId, userId, companyId, programId, cashierId, rewardTitle } = body;

    if (!cardId || !userId || !companyId || !programId || !rewardTitle) {
      return NextResponse.json(
        { error: 'Missing required reward redemption parameters.' },
        { status: 400 }
      );
    }

    const result = await cashierService.redeemCustomerReward({
      cardId,
      userId,
      companyId,
      programId,
      cashierId,
      rewardTitle,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Redemption API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to redeem reward.' },
      { status: 400 }
    );
  }
}
