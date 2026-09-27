import JSZip from 'jszip';
import crypto from 'crypto';
import { LoyaltyCard, LoyaltyProgram, Company, UserProfile } from '@/types';

// Minimal 1x1 transparent PNG base64 to ensure .pkpass is valid
const MINIMAL_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

export const walletService = {
  /**
   * Generate Apple Wallet PassKit JSON structure
   */
  generatePassJson(card: LoyaltyCard, program: LoyaltyProgram, company: Company, user: UserProfile) {
    const target = program.target_stamps || 6;
    const current = card.current_stamps || 0;
    const isReady = current >= target || card.status === 'reward_ready';

    // Hex to RGB string for Apple Wallet
    const hexToRgb = (hex: string, fallback = 'rgb(15, 23, 42)') => {
      try {
        const clean = hex.replace('#', '');
        const r = parseInt(clean.substring(0, 2), 16);
        const g = parseInt(clean.substring(2, 4), 16);
        const b = parseInt(clean.substring(4, 6), 16);
        return `rgb(${r}, ${g}, ${b})`;
      } catch {
        return fallback;
      }
    };

    return {
      formatVersion: 1,
      passTypeIdentifier: 'pass.com.loyaltypass.card',
      serialNumber: card.id || `CARD-${Date.now()}`,
      teamIdentifier: 'A1B2C3D4E5',
      organizationName: company.name || 'Merchant',
      description: `${company.name} Loyalty Pass`,
      logoText: company.name || 'Loyalty Pass',
      foregroundColor: 'rgb(255, 255, 255)',
      backgroundColor: hexToRgb(program.card_bg_color, 'rgb(15, 23, 42)'),
      labelColor: hexToRgb(program.card_accent_color, 'rgb(129, 140, 248)'),
      barcodes: [
        {
          format: 'PKBarcodeFormatQR',
          message: user.qr_code_token || 'LC-USER-0001',
          messageEncoding: 'iso-8859-1',
          altText: user.qr_code_token || 'LC-USER-0001',
        },
      ],
      storeCard: {
        headerFields: [
          {
            key: 'stamps',
            label: 'STAMPS',
            value: `${current} / ${target}`,
          },
        ],
        primaryFields: [
          {
            key: 'reward',
            label: 'NEXT REWARD',
            value: program.reward_title || '1 Free Service',
          },
        ],
        secondaryFields: [
          {
            key: 'holder',
            label: 'PASS HOLDER',
            value: user.full_name || 'Member',
          },
          {
            key: 'status',
            label: 'REWARD STATUS',
            value: isReady ? '★ UNLOCKED' : `${target - current} to go`,
          },
        ],
        auxiliaryFields: [
          {
            key: 'lifetime',
            label: 'LIFETIME VISITS',
            value: `${card.lifetime_stamps || current}`,
          },
          {
            key: 'store',
            label: 'LOCATION',
            value: company.address || company.category || 'In-Store',
          },
        ],
        backFields: [
          {
            key: 'terms',
            label: 'Terms & Conditions',
            value:
              program.description ||
              'Present this digital QR pass at checkout counter to receive stamps on qualifying visits. Once target is reached, redeem for your complimentary perk.',
          },
          {
            key: 'passToken',
            label: 'Member Pass Code',
            value: user.qr_code_token || 'LC-USER-0001',
          },
          {
            key: 'merchant',
            label: 'Merchant',
            value: `${company.name} (${company.category || 'Retail'})`,
          },
          {
            key: 'phone',
            label: 'Contact',
            value: company.phone || '+1 (555) 019-2834',
          },
        ],
      },
    };
  },

  /**
   * Bundle a complete .pkpass archive (ZIP format with manifest & pass.json)
   */
  async createAppleWalletPkpass(
    card: LoyaltyCard,
    program: LoyaltyProgram,
    company: Company,
    user: UserProfile
  ): Promise<Uint8Array> {
    const zip = new JSZip();
    const passJsonObj = this.generatePassJson(card, program, company, user);
    const passJsonStr = JSON.stringify(passJsonObj, null, 2);

    // Add pass.json
    zip.file('pass.json', passJsonStr);

    // Add PNG assets
    const pngBuffer = Buffer.from(MINIMAL_PNG_BASE64, 'base64');
    zip.file('icon.png', pngBuffer);
    zip.file('icon@2x.png', pngBuffer);
    zip.file('logo.png', pngBuffer);
    zip.file('logo@2x.png', pngBuffer);

    // Generate SHA1 manifest
    const sha1 = (content: string | Buffer) =>
      crypto.createHash('sha1').update(content).digest('hex');

    const manifest: Record<string, string> = {
      'pass.json': sha1(passJsonStr),
      'icon.png': sha1(pngBuffer),
      'icon@2x.png': sha1(pngBuffer),
      'logo.png': sha1(pngBuffer),
      'logo@2x.png': sha1(pngBuffer),
    };

    zip.file('manifest.json', JSON.stringify(manifest, null, 2));

    // Generate zip binary
    const content = await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    });

    return content;
  },

  /**
   * Generate Google Wallet Loyalty Object & Save Payload
   */
  generateGoogleWalletPayload(
    card: LoyaltyCard,
    program: LoyaltyProgram,
    company: Company,
    user: UserProfile
  ) {
    const target = program.target_stamps || 6;
    const current = card.current_stamps || 0;
    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID || '3388000000022314567';
    const classId = `${issuerId}.${program.id || 'loyalty_class'}`;
    const objectId = `${issuerId}.${card.id || 'card_' + user.qr_code_token}`;

    const loyaltyObject = {
      id: objectId,
      classId,
      state: 'ACTIVE',
      accountId: user.qr_code_token,
      accountName: user.full_name || 'Loyalty Member',
      barcode: {
        type: 'QR_CODE',
        value: user.qr_code_token,
        alternateText: user.qr_code_token,
      },
      loyaltyPoints: {
        label: 'Stamps',
        balance: {
          string: `${current} / ${target} Stamps`,
        },
      },
      secondaryLoyaltyPoints: {
        label: 'Reward',
        balance: {
          string: program.reward_title || 'Free Reward',
        },
      },
      textModulesData: [
        {
          id: 'reward_status',
          header: 'REWARD STATUS',
          body: current >= target ? 'REWARD UNLOCKED - Ready to Claim!' : `${target - current} stamps needed to claim free reward`,
        },
        {
          id: 'merchant_info',
          header: 'MERCHANT',
          body: company.name || 'Merchant Store',
        },
      ],
    };

    // Google Wallet Save Web Link format
    const googleSaveUrl = `https://pay.google.com/gp/v/save?data=${encodeURIComponent(
      JSON.stringify({
        loyaltyObjects: [loyaltyObject],
      })
    )}`;

    return {
      loyaltyObject,
      googleSaveUrl,
    };
  },
};
