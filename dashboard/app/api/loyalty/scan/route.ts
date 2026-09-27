import { NextRequest, NextResponse } from 'next/server';
import { cashierService } from '@/services/cashier.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { qrToken, companyId } = body;

    if (!qrToken || !companyId) {
      return NextResponse.json(
        { error: 'QR token and company ID are required.' },
        { status: 400 }
      );
    }

    const result = await cashierService.verifyCustomerByQrToken(qrToken, companyId);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Scan API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to verify customer QR code.' },
      { status: 400 }
    );
  }
}
