import { NextRequest, NextResponse } from 'next/server';
import { cashierService } from '@/services/cashier.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardId, userId, companyId, programId, cashierId, notes, stampsToAdd } = body;

    if (!cardId || !userId || !companyId || !programId) {
      return NextResponse.json(
        { error: 'Missing required stamp parameters.' },
        { status: 400 }
      );
    }

    const result = await cashierService.addVisitStamp({
      cardId,
      userId,
      companyId,
      programId,
      cashierId,
      notes,
      stampsToAdd: stampsToAdd || 1,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Add stamp API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to record visit stamp.' },
      { status: 400 }
    );
  }
}
