'use client';

import { useState } from 'react';
import { LoyaltyCard, LoyaltyProgram, Company } from '@/types';
import { QrCodeDisplay } from '@/components/qr/QrCodeDisplay';
import {
  X,
  CreditCard,
  Download,
  ExternalLink,
  Smartphone,
  CheckCircle2,
  Sparkles,
  Share2,
} from 'lucide-react';

interface WalletPassModalProps {
  card: LoyaltyCard;
  isOpen: boolean;
  onClose: () => void;
}

export function WalletPassModal({ card, isOpen, onClose }: WalletPassModalProps) {
  const [downloadingApple, setDownloadingApple] = useState(false);
  const [savingGoogle, setSavingGoogle] = useState(false);
  const [activeTab, setActiveTab] = useState<'apple' | 'google' | 'qr'>('apple');

  if (!isOpen) return null;

  const program = card.program;
  const company = card.company;
  const token = card.user?.qr_code_token || 'LC-USER-0001';

  const handleDownloadApple = async () => {
    try {
      setDownloadingApple(true);
      const url = `/api/wallet/apple/${card.id}`;
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(company?.name || 'loyalty').toLowerCase().replace(/[^a-z0-9]/g, '-')}-pass.pkpass`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Failed to download Apple Wallet pass:', e);
    } finally {
      setTimeout(() => setDownloadingApple(false), 1000);
    }
  };

  const handleSaveGoogle = async () => {
    try {
      setSavingGoogle(true);
      const res = await fetch(`/api/wallet/google/${card.id}`);
      const data = await res.json();
      if (data.saveUrl) {
        window.open(data.saveUrl, '_blank');
      }
    } catch (e) {
      console.error('Failed to save to Google Wallet:', e);
    } finally {
      setTimeout(() => setSavingGoogle(false), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-zinc-950" />
            <h3 className="font-bold text-zinc-950 text-base">Add to Mobile Wallet</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-950 p-1.5 rounded-full hover:bg-zinc-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-200 bg-zinc-50 p-1.5">
          <button
            onClick={() => setActiveTab('apple')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === 'apple'
                ? 'bg-zinc-950 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.8-12-14.28-6.19-9.13-11.22-20-15.08-32.61-3.86-12.61-5.79-24.87-5.79-36.78 0-14.56 3.69-26.74 11.06-36.52 7.37-9.78 16.74-14.8 28.11-15.06 4.35 0 9.28 1.05 14.79 3.17 5.51 2.13 9.4 3.24 11.66 3.35 2.03-.11 6.03-1.28 12-3.52 5.97-2.24 10.87-3.24 14.71-3.01 10.66.53 19.34 4.35 26.04 11.47-9.46 5.76-14.1 13.91-13.92 24.46.22 8.26 3.36 15.18 9.43 20.76 6.07 5.58 13.16 8.89 21.27 9.94-2.28 6.96-5.08 14.24-8.41 21.84zM119.22 31.84c0-7.72 2.76-14.92 8.28-21.6 5.52-6.68 12.35-10.74 20.5-12.18.22 1.09.33 2.18.33 3.27 0 7.61-2.82 14.92-8.45 21.93-5.63 7-12.57 10.96-20.82 11.88.11-1.09.16-2.18.16-3.3z" />
            </svg>
            Apple Wallet
          </button>

          <button
            onClick={() => setActiveTab('google')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === 'google'
                ? 'bg-zinc-950 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Google Wallet
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === 'qr'
                ? 'bg-zinc-950 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Quick QR
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {activeTab === 'apple' && (
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-zinc-950 text-white flex items-center justify-center mx-auto shadow-md border border-zinc-800">
                <svg className="w-8 h-8 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.8-12-14.28-6.19-9.13-11.22-20-15.08-32.61-3.86-12.61-5.79-24.87-5.79-36.78 0-14.56 3.69-26.74 11.06-36.52 7.37-9.78 16.74-14.8 28.11-15.06 4.35 0 9.28 1.05 14.79 3.17 5.51 2.13 9.4 3.24 11.66 3.35 2.03-.11 6.03-1.28 12-3.52 5.97-2.24 10.87-3.24 14.71-3.01 10.66.53 19.34 4.35 26.04 11.47-9.46 5.76-14.1 13.91-13.92 24.46.22 8.26 3.36 15.18 9.43 20.76 6.07 5.58 13.16 8.89 21.27 9.94-2.28 6.96-5.08 14.24-8.41 21.84zM119.22 31.84c0-7.72 2.76-14.92 8.28-21.6 5.52-6.68 12.35-10.74 20.5-12.18.22 1.09.33 2.18.33 3.27 0 7.61-2.82 14.92-8.45 21.93-5.63 7-12.57 10.96-20.82 11.88.11-1.09.16-2.18.16-3.3z" />
                </svg>
              </div>

              <div>
                <h4 className="text-base font-bold text-zinc-950">
                  Add to Apple Wallet (.pkpass)
                </h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                  Keep your {company?.name || 'loyalty'} card in your Apple Wallet for instant access from your lock screen and Apple Watch.
                </p>
              </div>

              {/* Pass details summary */}
              <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200 text-xs text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Pass Type:</span>
                  <span className="font-semibold text-zinc-900">Store Card PassKit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Current Balance:</span>
                  <span className="font-mono font-bold text-zinc-950">
                    {card.current_stamps} / {program?.target_stamps || 6} Stamps
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Barcode:</span>
                  <span className="font-mono font-semibold text-zinc-800">{token}</span>
                </div>
              </div>

              {/* Official Apple Wallet Badge button */}
              <button
                onClick={handleDownloadApple}
                disabled={downloadingApple}
                className="w-full py-3 px-6 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl font-semibold text-xs shadow-sm transition flex items-center justify-center gap-3 active:scale-95"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.8-12-14.28-6.19-9.13-11.22-20-15.08-32.61-3.86-12.61-5.79-24.87-5.79-36.78 0-14.56 3.69-26.74 11.06-36.52 7.37-9.78 16.74-14.8 28.11-15.06 4.35 0 9.28 1.05 14.79 3.17 5.51 2.13 9.4 3.24 11.66 3.35 2.03-.11 6.03-1.28 12-3.52 5.97-2.24 10.87-3.24 14.71-3.01 10.66.53 19.34 4.35 26.04 11.47-9.46 5.76-14.1 13.91-13.92 24.46.22 8.26 3.36 15.18 9.43 20.76 6.07 5.58 13.16 8.89 21.27 9.94-2.28 6.96-5.08 14.24-8.41 21.84zM119.22 31.84c0-7.72 2.76-14.92 8.28-21.6 5.52-6.68 12.35-10.74 20.5-12.18.22 1.09.33 2.18.33 3.27 0 7.61-2.82 14.92-8.45 21.93-5.63 7-12.57 10.96-20.82 11.88.11-1.09.16-2.18.16-3.3z" />
                </svg>
                <span>{downloadingApple ? 'Downloading Pass...' : 'Add to Apple Wallet'}</span>
              </button>

              <p className="text-[11px] text-zinc-400">
                Opening on Safari or iOS will automatically launch the native Apple Wallet preview.
              </p>
            </div>
          )}

          {activeTab === 'google' && (
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-zinc-950 text-white flex items-center justify-center mx-auto shadow-md border border-zinc-800">
                <span className="font-bold text-xl text-white">G</span>
              </div>

              <div>
                <h4 className="text-base font-bold text-zinc-950">
                  Save to Google Wallet
                </h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                  Access your digital stamp pass instantly in Google Wallet on Android and Wear OS.
                </p>
              </div>

              {/* Pass details summary */}
              <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200 text-xs text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Google Loyalty Object:</span>
                  <span className="font-semibold text-zinc-900">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Account ID:</span>
                  <span className="font-mono font-semibold text-zinc-800">{token}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Stamps:</span>
                  <span className="font-mono font-bold text-zinc-950">
                    {card.current_stamps} / {program?.target_stamps || 6}
                  </span>
                </div>
              </div>

              {/* Official Google Wallet Save button */}
              <button
                onClick={handleSaveGoogle}
                disabled={savingGoogle}
                className="w-full py-3 px-6 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl font-semibold text-xs shadow-sm transition flex items-center justify-center gap-3 active:scale-95"
              >
                <span>{savingGoogle ? 'Opening Wallet...' : 'Save to Google Wallet'}</span>
              </button>

              <p className="text-[11px] text-zinc-400">
                Saves to your Google Account and syncs with your Android phone and smart watch.
              </p>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="space-y-4">
              <QrCodeDisplay
                token={token}
                userName={card.user?.full_name || 'Member'}
                size={190}
                showFullscreenToggle={true}
              />
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-zinc-200 flex items-center justify-between text-[11px] text-zinc-500">
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-zinc-700" />
              <span>Or tap &ldquo;Add to Home Screen&rdquo; in mobile browser</span>
            </div>
            <button
              onClick={onClose}
              className="font-semibold text-zinc-900 hover:underline"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
