import React from 'react';
import { X, ShieldAlert, CheckCircle, FileText } from 'lucide-react';
import { DOCTOR_PROFILE } from '../data/defaultData';

interface MedicalDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MedicalDisclaimerModal: React.FC<MedicalDisclaimerModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-[#CCD8CF] overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-[#1D4D43] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-xl font-bold font-serif">
              Medical Disclaimer, Ethics &amp; Consent
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6 text-xs text-slate-700 leading-relaxed max-h-[75vh] overflow-y-auto">
          
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[#1B2A26] uppercase tracking-wider">
              1. Professional Identity &amp; Qualifications
            </h4>
            <p>
              This healthcare application is maintained for the personal medical practice of <strong>Dr. Harshika Singh</strong>, holding BHMS and MD (Hom.) degrees. In strict accordance with ethical homoeopathic regulations, Dr. Harshika Singh is a registered homoeopathic physician providing individualized, constitutional care and is not designated or advertised as an allopathic medical specialist.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[#1B2A26] uppercase tracking-wider">
              2. No Guaranteed-Cure Claims Policy
            </h4>
            <p>
              Homoeopathy evaluates systemic vital force, thermal response, and chronic miasmatic tendencies. Healing response times vary significantly based on disease chronicity, individual metabolic terrain, and patient compliance. <strong>No guaranteed cures, quick-fix promises, or fabricated clinical outcome statistics are made on this platform.</strong>
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[#1B2A26] uppercase tracking-wider">
              3. Telemedicine Consultation Scope &amp; Consent
            </h4>
            <p>
              Online video and voice consultations are conducted in accordance with the Telemedicine Practice Guidelines of India. Patients are advised that telemedicine consultations rely on patient-reported history and digital laboratory investigations. It is the responsibility of the patient to provide truthful, complete medical records.
            </p>
            <p className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 font-medium">
              Emergency Situations: If you are experiencing sudden severe chest pain, severe breathlessness, acute neurological deficits, uncontrolled bleeding, or acute surgical abdomen, do not wait for an online consultation. Seek immediate attention at the nearest emergency hospital.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[#1B2A26] uppercase tracking-wider">
              4. Concomitant Conventional Medication
            </h4>
            <p>
              Constitutional homoeopathic treatment can safely run parallel to conventional medical therapies (e.g. Levothyroxine for hypothyroidism, anti-hypertensive drugs, or insulin). Patients are strictly instructed <strong>never to discontinue or adjust conventional prescribed drugs</strong> without explicit consultation and written guidance from their primary treating allopathic physician.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[#1B2A26] uppercase tracking-wider">
              5. Patient Privacy &amp; Data Security
            </h4>
            <p>
              Patient identifiers, contact numbers, and uploaded diagnostic reports are encrypted and stored in secure cloud infrastructure protected by authenticated access rules. Patient information will never be sold, rented, or shared with third parties for commercial advertising.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[#1B2A26] uppercase tracking-wider">
              6. Official Domain &amp; Practice Address
            </h4>
            <p>
              Official Website: <a href="https://www.drharshika.in" target="_blank" rel="noopener noreferrer" className="text-[#1D4D43] underline font-semibold">https://www.drharshika.in</a><br />
              Direct Clinic WhatsApp Desk: +91 80102 81579
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#1D4D43] text-white text-xs font-semibold hover:bg-[#163D35] transition-colors"
            >
              I Understand &amp; Acknowledge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
