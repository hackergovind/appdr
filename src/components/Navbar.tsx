import React from 'react';
import { Calendar, Shield, User, Stethoscope } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  activeTab: 'home' | 'library' | 'portal' | 'admin';
  setActiveTab: (tab: 'home' | 'library' | 'portal' | 'admin') => void;
  onOpenBooking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenBooking,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FBFBF9]/95 backdrop-blur-md border-b border-[#DDE6E0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single element brand wordmark */}
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#1D4D43] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Stethoscope className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold font-serif tracking-tight text-[#1B2A26] leading-none">
              Dr. Harshika
            </span>
            <span className="text-[10px] tracking-widest text-[#4A7C59] uppercase font-semibold mt-0.5">
              Wellness &amp; Homoeopathy
            </span>
          </div>
        </button>

        {/* Zone 2: 4-5 clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'home' ? 'text-[#1D4D43] font-bold' : 'hover:text-slate-900'
            }`}
          >
            Clinical Focus
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'library' ? 'text-[#1D4D43] font-bold' : 'hover:text-slate-900'
            }`}
          >
            Health Library
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('portal')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'portal' ? 'text-[#1D4D43] font-bold' : 'hover:text-slate-900'
            }`}
          >
            Patient Portal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'admin' ? 'text-[#1D4D43] font-bold' : 'hover:text-slate-900'
            }`}
          >
            Doctor Login
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action + PWA install */}
        <div className="flex items-center gap-2.5 shrink-0">
          <PWAInstallButton />
          <button
            type="button"
            onClick={onOpenBooking}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#1D4D43] hover:bg-[#163D35] rounded-xl transition-all shadow-xs whitespace-nowrap shrink-0 active:scale-98"
          >
            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Book Appointment</span>
          </button>
        </div>

      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-[#E8EFE9] bg-white py-2 px-3 text-[11px] font-semibold text-slate-600">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`px-2 py-1 rounded-md ${activeTab === 'home' ? 'text-[#1D4D43] bg-[#E8EFE9]' : ''}`}
        >
          Home
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('library')}
          className={`px-2 py-1 rounded-md ${activeTab === 'library' ? 'text-[#1D4D43] bg-[#E8EFE9]' : ''}`}
        >
          Library
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('portal')}
          className={`px-2 py-1 rounded-md ${activeTab === 'portal' ? 'text-[#1D4D43] bg-[#E8EFE9]' : ''}`}
        >
          My Portal
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('admin')}
          className={`px-2 py-1 rounded-md ${activeTab === 'admin' ? 'text-[#1D4D43] bg-[#E8EFE9]' : ''}`}
        >
          Doctor
        </button>
      </div>
    </header>
  );
};
