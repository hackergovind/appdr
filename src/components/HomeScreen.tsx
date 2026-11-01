import React, { useState } from 'react';
import { 
  Calendar, ShieldCheck, ArrowRight, MessageCircle, HeartPulse, 
  Sparkles, CheckCircle2, ChevronDown, ChevronUp, FileText, Activity, 
  HelpCircle, Phone, Stethoscope, Award, MapPin
} from 'lucide-react';
import { CLINICAL_FOCUS_PILLARS, CONSULTATION_STEPS, CLINIC_FAQS, DOCTOR_PROFILE } from '../data/defaultData';
import { Article, ConsultationCategory } from '../types';

interface HomeScreenProps {
  onOpenBooking: (category?: ConsultationCategory) => void;
  onOpenTriage: () => void;
  onOpenLibrary: () => void;
  articles: Article[];
  consultationFee: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenBooking,
  onOpenTriage,
  onOpenLibrary,
  articles,
  consultationFee,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedFocus, setSelectedFocus] = useState<string>('hormonal_balance');

  const toggleFaq = (idx: number) => {
    setOpenFaq(prev => prev === idx ? null : idx);
  };

  const activeFocusPillar = CLINICAL_FOCUS_PILLARS.find(p => p.id === selectedFocus) || CLINICAL_FOCUS_PILLARS[0];

  return (
    <div className="space-y-16 md:space-y-24 pb-16">
      
      {/* 1. HERO SECTION: Immediate Appointment Visibility & Doctor Brand */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F0F5F1] via-[#F8FAF8] to-[#FBFBF9] border-b border-[#DDE6E0] pt-8 md:pt-14 pb-12 md:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left 7 Columns: Doctor Introduction & Prominent Booking CTA */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Doctor Credentials Kicker (Quiet Unboxed Text) */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#1D4D43]">
                <span>Dr. Harshika Singh</span>
                <span aria-hidden="true" className="text-[#A3BFAB]">·</span>
                <span className="text-slate-600">BHMS, MD (Hom.)</span>
                <span aria-hidden="true" className="text-[#A3BFAB]">·</span>
                <span className="text-[#A28020] font-serif tracking-wider">Evidence-Based Homoeopathy</span>
              </div>

              {/* Primary Headline with Balance */}
              <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-bold font-serif text-[#1B2A26] leading-[1.15] tracking-tight text-balance">
                Holistic care tailored to your body's innate balance.
              </h1>

              {/* Warm Professional Welcome Message */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                Welcome to my personal homeopathic practice. I work with patients across India experiencing chronic hormonal imbalances, thyroid fatigue, and joint mobility restrictions—focusing on thorough constitutional analysis rather than temporary symptom suppression.
              </p>

              {/* Immediate Primary Booking & Assessment Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenBooking()}
                  className="px-6 py-3.5 rounded-xl bg-[#1D4D43] hover:bg-[#163D35] text-white text-xs sm:text-sm font-bold tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md active:scale-98"
                >
                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  <span>Book an Appointment (₹{consultationFee})</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenTriage}
                  className="px-5 py-3.5 rounded-xl bg-white hover:bg-[#F0F5F1] text-[#1D4D43] border border-[#CCD8CF] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <Activity className="w-4 h-4 text-[#4A7C59]" />
                  <span>Clinical Symptom Triage</span>
                </button>
              </div>

              {/* Trust & Ethical Badges */}
              <div className="pt-4 border-t border-[#DDE6E0]/60 grid grid-cols-3 gap-4 text-xs text-slate-600">
                <div className="space-y-0.5">
                  <div className="font-bold text-[#1B2A26] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1D4D43]" />
                    <span>Online Pan-India</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Video &amp; Voice Sessions</div>
                </div>

                <div className="space-y-0.5">
                  <div className="font-bold text-[#1B2A26] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1D4D43]" />
                    <span>Constitutional</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Personalized Totality</div>
                </div>

                <div className="space-y-0.5">
                  <div className="font-bold text-[#1B2A26] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1D4D43]" />
                    <span>Medicine Support</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Safe Courier Delivery</div>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Doctor Identity Crest & Profile Frame */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm rounded-3xl bg-white border border-[#CCD8CF] p-6 shadow-sm relative overflow-hidden">
                {/* Botanical Background Pattern */}
                <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#E8EFE9]/60 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-[#D4AF37]/10 blur-xl pointer-events-none" />

                {/* Doctor Avatar / Visual Monogram */}
                <div className="relative mb-6 text-center">
                  <div className="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-tr from-[#163932] to-[#2D5A3E] p-1 shadow-md">
                    <div className="w-full h-full rounded-[14px] bg-[#163932] flex flex-col items-center justify-center text-white relative overflow-hidden">
                      <Stethoscope className="w-12 h-12 text-[#D4AF37] mb-1 opacity-90" />
                      <span className="text-[11px] font-bold tracking-widest text-emerald-100 font-serif">DR. HARSHIKA</span>
                      <span className="text-[9px] text-[#A3BFAB]">BHMS, MD (Hom.)</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h2 className="text-xl font-bold font-serif text-[#1B2A26]">Dr. Harshika Singh</h2>
                    <p className="text-xs text-[#4A7C59] font-medium mt-0.5">Homeopathic Physician</p>
                  </div>
                </div>

                {/* Practice Highlights */}
                <div className="space-y-2.5 text-xs text-slate-600 bg-[#FBFBF9] p-4 rounded-xl border border-slate-100 mb-5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-400">Focus Areas:</span>
                    <span className="font-semibold text-slate-800">Hormonal, Thyroid &amp; Joints</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-400">Consultation Fee:</span>
                    <span className="font-bold text-[#1D4D43] text-sm">₹{consultationFee}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Delivery Scope:</span>
                    <span className="font-semibold text-slate-800">Across All States in India</span>
                  </div>
                </div>

                {/* Direct WhatsApp Quick Contact */}
                <a
                  href={`https://wa.me/${DOCTOR_PROFILE.whatsappNumber}?text=${encodeURIComponent("Hello Dr. Harshika, I am interested in scheduling an online homoeopathic consultation.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Enquire via WhatsApp (+91 80102 81579)</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. EXPLORE CLINICAL FOCUS: Hormonal Health, Thyroid Care & Joint Mobility */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1D4D43]">
            Clinical Focus
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold font-serif text-[#1B2A26] mt-1">
            Care Rooted in Systemic Understanding
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Rather than generic prescriptions, my consultations concentrate on specific chronic conditions where individualized homoeopathic constitutional care offers profound supportive benefits.
          </p>
        </div>

        {/* Interactive Segmented Selector for Clinical Pillars */}
        <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-2">
          {CLINICAL_FOCUS_PILLARS.map((pillar) => (
            <button
              key={pillar.id}
              type="button"
              onClick={() => setSelectedFocus(pillar.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedFocus === pillar.id
                  ? 'bg-[#1D4D43] text-white shadow-xs'
                  : 'bg-white border border-[#CCD8CF] text-slate-600 hover:bg-[#F0F5F1]'
              }`}
            >
              {pillar.title}
            </button>
          ))}
        </div>

        {/* Detailed Focus Card with Recommended Diagnostic Investigations */}
        <div className="bg-white rounded-3xl border border-[#CCD8CF] p-6 sm:p-10 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                Clinical Evaluation
              </span>
              <h3 className="text-2xl font-bold font-serif text-[#1B2A26]">
                {activeFocusPillar.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {activeFocusPillar.summary}
              </p>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-[#1D4D43] uppercase tracking-wider">
                  Consultation Methodology
                </span>
                <ul className="space-y-2 text-xs text-slate-700">
                  {activeFocusPillar.keyPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#4A7C59] shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#F0F5F1] p-6 rounded-2xl border border-[#CCD8CF] space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1D4D43]">
                Helpful Pre-Consultation Reports
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                If you have undergone recent investigations, keeping these records ready assists Dr. Harshika during case review:
              </p>
              <div className="flex flex-wrap gap-2">
                {activeFocusPillar.recommendedTests.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium bg-white text-slate-800 px-3 py-1 rounded-lg border border-[#CCD8CF]"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onOpenBooking(activeFocusPillar.id as ConsultationCategory)}
                  className="w-full py-3 rounded-xl bg-[#1D4D43] hover:bg-[#163D35] text-white text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <span>Book for {activeFocusPillar.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW THE ONLINE CONSULTATION WORKS: Simple 4-Step Process */}
      <section className="bg-[#F0F5F1] py-14 md:py-20 border-y border-[#DDE6E0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1D4D43]">
              Simple Telemedicine Journey
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif text-[#1B2A26] mt-1">
              How Your Online Consultation Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Structured, empathetic consultation from the comfort of your home anywhere in India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {CONSULTATION_STEPS.map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-2xl border border-[#CCD8CF] p-6 shadow-xs space-y-3 relative flex flex-col justify-between"
              >
                <div>
                  <div className="text-2xl font-bold font-serif text-[#D4AF37] mb-2">
                    {item.step}
                  </div>
                  <h3 className="text-base font-bold text-[#1B2A26]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-[#1D4D43]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Step Verified</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => onOpenBooking()}
              className="px-6 py-3.5 rounded-xl bg-[#1D4D43] hover:bg-[#163D35] text-white text-xs sm:text-sm font-bold tracking-wide shadow-sm transition-all"
            >
              Start Consultation Booking
            </button>
          </div>
        </div>
      </section>

      {/* 4. HEALTH EDUCATION HIGHLIGHTS: Latest Educational Guides */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1D4D43]">
              Health Education
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif text-[#1B2A26] mt-1">
              Insights from Clinical Practice
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Medically grounded articles exploring thyroid health, hormonal balance, and joint mobility.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenLibrary}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1D4D43] hover:underline"
          >
            <span>Explore All Articles</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.slice(0, 2).map((art) => (
            <div
              key={art.id}
              onClick={onOpenLibrary}
              className="bg-white rounded-2xl border border-[#CCD8CF] hover:border-[#1D4D43] p-6 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="uppercase font-semibold tracking-wider text-[#1D4D43] text-[10px]">
                    {art.category.replace('_', ' ')}
                  </span>
                  <span>{art.readTime}</span>
                </div>
                <h3 className="text-lg font-bold font-serif text-[#1B2A26]">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {art.summary}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">{art.publishedAt}</span>
                <span className="font-semibold text-[#1D4D43] flex items-center gap-1">
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1D4D43]">
            Patient Inquiries
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold font-serif text-[#1B2A26] mt-1">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Clear, honest answers regarding consultation methodology, medication delivery, and medical ethics.
          </p>
        </div>

        <div className="space-y-3">
          {CLINIC_FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#CCD8CF] overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4"
                >
                  <span className="text-sm font-bold text-[#1B2A26]">
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#1D4D43] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. ETHICAL PRACTICE NOTICE & WHATSAPP DESK */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-[#1D4D43] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                Evidence-Based Homoeopathy
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold font-serif text-[#F4E8C1] leading-tight">
                Ready to take a gentle, constitutional step toward health?
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
                Connect directly with Dr. Harshika Singh, BHMS, MD (Hom.). We provide structured intake, verified digital prescriptions, and courier delivery of authentic homoeopathic medicines across India.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenBooking()}
                  className="px-6 py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#BFA15F] text-[#1B2A26] font-bold text-xs sm:text-sm shadow-sm transition-colors"
                >
                  Book Consultation Slot (₹{consultationFee})
                </button>
                <a
                  href={`https://wa.me/${DOCTOR_PROFILE.whatsappNumber}?text=${encodeURIComponent("Hello Dr. Harshika, I would like to schedule an online homoeopathic consultation.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp Inquiry Desk</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white/5 border border-white/10 p-5 rounded-2xl text-xs space-y-2 text-slate-300">
              <div className="font-bold text-[#D4AF37] uppercase tracking-wider text-[11px]">
                Doctor Ethics Pledge
              </div>
              <p className="leading-relaxed">
                Zero false guarantees. Zero unverified claims. Every patient is treated as a unique, living individual deserving respectful listening and evidence-informed homeopathic care.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
