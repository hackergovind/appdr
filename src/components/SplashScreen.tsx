import React, { useEffect, useState } from 'react';
import { Stethoscope } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(onFinish, 400); // Wait for transition
    }, 1400);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      onClick={() => { setFading(true); setTimeout(onFinish, 200); }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#163932] text-white transition-opacity duration-400 cursor-pointer ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="text-center space-y-4 px-6 animate-in fade-in zoom-in-95 duration-500">
        {/* Emblem */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-gradient-to-tr from-[#1D4D43] to-[#2D5A3E] border border-[#D4AF37]/50 flex items-center justify-center shadow-xl">
          <Stethoscope className="w-10 h-10 sm:w-12 sm:h-12 text-[#D4AF37]" />
        </div>

        {/* Brand Text */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-[#F4E8C1]">
            Dr. Harshika Singh
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200 tracking-wider">
            BHMS, MD (Hom.)
          </p>
        </div>

        <div className="pt-2">
          <span className="text-[10px] tracking-widest uppercase font-semibold text-[#D4AF37] border-y border-[#D4AF37]/40 py-1 px-4 inline-block">
            Evidence-Based Homoeopathy
          </span>
        </div>

        {/* Loading shimmer line */}
        <div className="w-24 h-0.5 bg-white/20 mx-auto rounded-full overflow-hidden mt-6">
          <div className="w-full h-full bg-[#D4AF37] animate-pulse" />
        </div>
      </div>
    </div>
  );
};
