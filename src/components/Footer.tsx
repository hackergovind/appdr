import React from 'react';
import { Stethoscope, MessageCircle, Mail, Globe, Shield } from 'lucide-react';
import { DOCTOR_PROFILE } from '../data/defaultData';

interface FooterProps {
  setActiveTab: (tab: 'home' | 'library' | 'portal' | 'admin') => void;
  onOpenBooking: () => void;
  onOpenDisclaimer: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  setActiveTab,
  onOpenBooking,
  onOpenDisclaimer,
}) => {
  return (
    <footer className="bg-[#163932] text-white pt-14 pb-10 border-t border-[#235246]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Stethoscope className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif text-[#F4E8C1]">
                  Dr. Harshika Singh
                </h3>
                <p className="text-xs text-emerald-200">
                  {DOCTOR_PROFILE.qualifications} · {DOCTOR_PROFILE.tagline}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-md">
              Evidence-based homoeopathy with clinical focus on hormonal equilibrium, thyroid health, and joint mobility. Providing individualized, empathetic online consultations to patients across India.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-100 pt-1">
              <a
                href={`https://wa.me/${DOCTOR_PROFILE.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>+91 80102 81579 (WhatsApp Enquiry)</span>
              </a>
              <span>·</span>
              <a
                href={DOCTOR_PROFILE.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>drharshika.in</span>
              </a>
            </div>
          </div>

          {/* Practice Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button
                  type="button"
                  onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors"
                >
                  Home &amp; Clinical Focus
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => { setActiveTab('library'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors"
                >
                  Health Education Library
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => { setActiveTab('portal'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors"
                >
                  Patient Portal &amp; Reports
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenBooking}
                  className="hover:text-white transition-colors"
                >
                  Book Online Consultation
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => { setActiveTab('admin'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors text-slate-400"
                >
                  Doctor Console
                </button>
              </li>
            </ul>
          </div>

          {/* Ethics & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              Ethics &amp; Standards
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button
                  type="button"
                  onClick={onOpenDisclaimer}
                  className="hover:text-white transition-colors underline"
                >
                  Medical Disclaimer &amp; Ethics Notice
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenDisclaimer}
                  className="hover:text-white transition-colors"
                >
                  Telemedicine Consent Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenDisclaimer}
                  className="hover:text-white transition-colors"
                >
                  Patient Data Privacy
                </button>
              </li>
            </ul>
            <div className="pt-2 text-[11px] text-emerald-200/80 leading-normal">
              Registered Homoeopathy Practice. Practicing in adherence to National Commission for Homoeopathy ethical regulations.
            </div>
          </div>

        </div>

        {/* Bottom Disclaimer Strip */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>
            © {new Date().getFullYear()} Dr. Harshika | Wellness &amp; Homoeopathy. All rights reserved.
          </p>
          <p className="text-center md:text-right max-w-xl">
            <strong>Notice:</strong> Online consultations are not intended for acute emergency conditions. In case of medical emergencies, please visit your nearest hospital emergency department.
          </p>
        </div>
      </div>
    </footer>
  );
};
