'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, Maximize2, Minimize2, Download } from 'lucide-react';

interface QrCodeDisplayProps {
  token: string;
  size?: number;
  userName?: string | null;
  companyName?: string;
  showFullscreenToggle?: boolean;
}

export function QrCodeDisplay({
  token,
  size = 200,
  userName,
  showFullscreenToggle = true,
}: QrCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (canvasRef.current && token) {
      QRCode.toCanvas(canvasRef.current, token, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      }).catch((err) => {
        console.error('QR code generation error:', err);
      });
    }
  }, [token, size]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQr = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `loyalty-qr-${token}.png`;
    link.href = url;
    link.click();
  };

  return (
    <div className="flex flex-col items-center bg-white rounded-2xl p-6 shadow-sm border border-zinc-200">
      {/* QR Canvas */}
      <div className="relative p-3 bg-white rounded-xl border border-zinc-200 shadow-sm flex items-center justify-center">
        <canvas ref={canvasRef} className="rounded-lg max-w-full h-auto" />
      </div>

      {/* Token Display and Copy */}
      <div className="mt-4 flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg">
        <span className="font-mono text-sm font-semibold tracking-wider text-zinc-800">
          {token}
        </span>
        <button
          onClick={copyToClipboard}
          className="text-zinc-400 hover:text-zinc-950 transition p-1 rounded"
          title="Copy code"
        >
          {copied ? <Check className="w-4 h-4 text-zinc-900" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Customer Name info */}
      {userName && (
        <p className="text-xs text-zinc-500 mt-2 font-medium">Pass Holder: {userName}</p>
      )}

      {/* Action buttons */}
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={downloadQr}
          className="flex items-center gap-1.5 text-xs text-zinc-700 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg font-medium transition"
        >
          <Download className="w-3.5 h-3.5" />
          Save Pass
        </button>

        {showFullscreenToggle && (
          <button
            onClick={() => setIsFullscreen(true)}
            className="flex items-center gap-1.5 text-xs text-white hover:bg-zinc-800 bg-zinc-950 px-3 py-1.5 rounded-lg font-medium transition shadow-sm"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Expand for Scan
          </button>
        )}
      </div>

      {/* Fullscreen Overlay Modal for Easy Scanning at Counter */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="bg-zinc-950 text-white rounded-3xl p-8 max-w-sm w-full flex flex-col items-center shadow-2xl border border-zinc-800 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition"
            >
              <Minimize2 className="w-5 h-5" />
            </button>

            <span className="text-[11px] uppercase font-mono tracking-widest text-zinc-400 mb-2">
              Present to Cashier
            </span>
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              {userName || 'Digital Loyalty Pass'}
            </h3>

            <div className="p-4 bg-white border-4 border-zinc-900 rounded-2xl shadow-lg mb-4">
              {/* Large QR display */}
              <canvas
                ref={(el) => {
                  if (el && token) {
                    QRCode.toCanvas(el, token, {
                      width: 260,
                      margin: 1,
                      color: { dark: '#000000', light: '#FFFFFF' },
                    });
                  }
                }}
              />
            </div>

            <p className="font-mono text-lg font-bold tracking-widest text-white mb-1">
              {token}
            </p>
            <p className="text-xs text-zinc-400 text-center">
              Turn up screen brightness for instant counter scanning
            </p>

            <button
              onClick={() => setIsFullscreen(false)}
              className="mt-6 w-full py-2.5 bg-white hover:bg-zinc-100 text-zinc-950 rounded-xl text-sm font-semibold transition shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
