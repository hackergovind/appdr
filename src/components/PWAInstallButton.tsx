import React, { useState } from 'react';
import { Download, Share2, X, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 3000);
    }
  };

  return (
    <>
      {isInstallable && (
        <button
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1D4D43] bg-[#E8EFE9] hover:bg-[#DDE6E0] border border-[#CCD8CF] rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs"
          title="Install Dr. Harshika app on your device"
        >
          {justInstalled ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Installed!</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </>
          )}
        </button>
      )}

      {isIOS && (
        <>
          <button
            onClick={() => setShowIOSGuide(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1D4D43] bg-[#E8EFE9] hover:bg-[#DDE6E0] border border-[#CCD8CF] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Install on iOS</span>
          </button>

          {showIOSGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
              <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-[#CCD8CF]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <img src="/icon.svg" alt="App Icon" className="w-8 h-8 rounded-lg" />
                    <h3 className="text-base font-semibold text-[#1B2A26]">Install Dr. Harshika App</h3>
                  </div>
                  <button
                    onClick={() => setShowIOSGuide(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3 text-sm text-slate-600">
                  <p className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E8EFE9] text-[#1D4D43] font-semibold flex items-center justify-center text-xs">1</span>
                    <span>Tap the <strong>Share</strong> icon in the Safari navigation bar at the bottom.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E8EFE9] text-[#1D4D43] font-semibold flex items-center justify-center text-xs">2</span>
                    <span>Scroll down and select <strong>Add to Home Screen</strong>.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E8EFE9] text-[#1D4D43] font-semibold flex items-center justify-center text-xs">3</span>
                    <span>Tap <strong>Add</strong> in the top right corner.</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="mt-5 w-full rounded-xl bg-[#1D4D43] py-2.5 text-xs font-semibold text-white hover:bg-[#163D35] transition-colors"
                >
                  Understood
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};
