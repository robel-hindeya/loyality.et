'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, Keyboard, AlertCircle, RefreshCw } from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (token: string) => void;
}

export function QrScannerModal({ isOpen, onClose, onScanSuccess }: QrScannerModalProps) {
  const [manualCode, setManualCode] = useState('');
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'html5-qr-reader-container';

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    if (mode === 'camera') {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, mode]);

  const startCamera = async () => {
    setIsStartingCamera(true);
    setErrorMessage(null);

    // Give DOM a tick to render container
    await new Promise((r) => setTimeout(r, 150));

    try {
      const element = document.getElementById(readerElementId);
      if (!element) return;

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerElementId);
      }

      const qrCodeSuccessCallback = (decodedText: string) => {
        // Play beep sound if supported
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, audioCtx.currentTime);
          osc.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.15);
        } catch {}

        stopCamera();
        onScanSuccess(decodedText);
      };

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        qrCodeSuccessCallback,
        undefined
      );
    } catch (err: any) {
      console.warn('Camera scan init warning:', err);
      setErrorMessage(
        'Camera access not available or blocked. Please switch to manual code input below.'
      );
      setMode('manual');
    } finally {
      setIsStartingCamera(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      }
      scannerRef.current = null;
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onScanSuccess(manualCode.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative text-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-zinc-300" />
            <h3 className="font-semibold text-white">Scan Customer QR</h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-zinc-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode switcher tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/60 p-1">
          <button
            type="button"
            onClick={() => setMode('camera')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition ${
              mode === 'camera'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" /> Live Camera
          </button>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setMode('manual');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition ${
              mode === 'manual'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Keyboard className="w-4 h-4" /> Manual Code
          </button>
        </div>

        {/* Content area */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs p-3 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-zinc-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {mode === 'camera' ? (
            <div className="flex flex-col items-center">
              <div
                id={readerElementId}
                className="w-full max-w-[300px] h-[300px] bg-black rounded-2xl overflow-hidden relative border-2 border-zinc-700 shadow-inner flex items-center justify-center"
              >
                {isStartingCamera && (
                  <div className="flex flex-col items-center text-zinc-400 gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-zinc-300" />
                    <span className="text-xs">Initializing camera feed...</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-4 text-center">
                Point camera directly at customer&apos;s digital card QR code.
              </p>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  Customer Loyalty Pass Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. LC-8A7B-9C1D"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl font-mono text-center tracking-widest text-lg font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white uppercase"
                  autoFocus
                />
                <p className="text-xs text-zinc-500 mt-1.5 text-center">
                  Enter the code displayed beneath the customer&apos;s QR code
                </p>
              </div>

              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="w-full py-3 bg-white hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-semibold rounded-xl text-sm transition shadow-sm"
              >
                Verify & Open Card
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
