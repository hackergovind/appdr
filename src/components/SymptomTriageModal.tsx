import React, { useState } from 'react';
import { X, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import { ConsultationCategory } from '../types';

interface SymptomTriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToBooking: (category: ConsultationCategory, notes: string) => void;
}

interface Question {
  id: string;
  category: ConsultationCategory;
  question: string;
  description: string;
  options: { label: string; score: number }[];
}

const TRIAGE_QUESTIONS: Question[] = [
  {
    id: "primary_focus",
    category: "hormonal_balance",
    question: "What is your primary area of health concern?",
    description: "Select the clinical category that best reflects your current symptoms.",
    options: [
      { label: "Irregular cycles, facial hair, or suspected PCOS", score: 2 },
      { label: "Sluggish thyroid, fatigue, cold intolerance, or weight shifts", score: 2 },
      { label: "Persistent joint aches, morning stiffness, or mobility limits", score: 2 },
      { label: "Diffuse hair shedding, brittle nails, or metabolic dips", score: 1 },
      { label: "General chronic fatigue, digestive sluggishness, or sleep issues", score: 1 }
    ]
  },
  {
    id: "duration",
    category: "general_wellness",
    question: "How long have you experienced these symptoms?",
    description: "Disease chronicity helps determine constitutional evaluation scope.",
    options: [
      { label: "Less than 3 months (Recent onset)", score: 1 },
      { label: "3 to 12 months (Persistent)", score: 2 },
      { label: "1 to 3 years (Chronic)", score: 3 },
      { label: "Over 3 years (Longstanding chronic condition)", score: 4 }
    ]
  },
  {
    id: "energy_metabolism",
    category: "thyroid_care",
    question: "How do your energy and temperature preferences behave?",
    description: "Homoeopathic intake evaluates thermal sensitivity and daily diurnal rhythms.",
    options: [
      { label: "Noticeably sensitive to cold; sluggish mornings and sluggish bowel", score: 3 },
      { label: "Often feel warm; perspiration on slight exertion or irritability", score: 2 },
      { label: "Extreme afternoon energy slump (between 2 PM - 5 PM)", score: 2 },
      { label: "Normal thermal tolerance with occasional fatigue", score: 1 }
    ]
  },
  {
    id: "prior_treatment",
    category: "general_wellness",
    question: "Have you undergone previous conventional investigations or therapy?",
    description: "Understanding your current medical routine and lab history.",
    options: [
      { label: "Yes, currently taking conventional prescription medication", score: 2 },
      { label: "Have recent diagnostic lab reports but not on medication", score: 2 },
      { label: "Have not yet done formal blood tests or ultrasound", score: 1 },
      { label: "Tried multiple therapies with temporary or incomplete relief", score: 3 }
    ]
  }
];

export const SymptomTriageModal: React.FC<SymptomTriageModalProps> = ({
  isOpen,
  onClose,
  onProceedToBooking,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const currentQ = TRIAGE_QUESTIONS[currentStep];

  const handleSelectOption = (index: number) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQ.id]: index }));
  };

  const handleNext = () => {
    if (currentStep < TRIAGE_QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const resetTriage = () => {
    setCurrentStep(0);
    setSelectedAnswers({});
    setCompleted(false);
  };

  // Determine triage result
  const primaryChoiceIndex = selectedAnswers['primary_focus'] ?? 0;
  let resolvedCategory: ConsultationCategory = 'hormonal_balance';
  if (primaryChoiceIndex === 1) resolvedCategory = 'thyroid_care';
  else if (primaryChoiceIndex === 2) resolvedCategory = 'joint_wellness';
  else if (primaryChoiceIndex === 3) resolvedCategory = 'hair_fall';
  else if (primaryChoiceIndex === 4) resolvedCategory = 'general_wellness';

  const triageSummaryNotes = `Self-Assessment Summary:\n- Focus Area: ${TRIAGE_QUESTIONS[0].options[primaryChoiceIndex]?.label}\n- Duration: ${TRIAGE_QUESTIONS[1].options[selectedAnswers['duration'] ?? 0]?.label}\n- Thermal & Energy: ${TRIAGE_QUESTIONS[2].options[selectedAnswers['energy_metabolism'] ?? 0]?.label}\n- Prior Care: ${TRIAGE_QUESTIONS[3].options[selectedAnswers['prior_treatment'] ?? 0]?.label}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-[#CCD8CF] overflow-hidden my-6">
        {/* Top Header */}
        <div className="bg-[#1D4D43] text-white px-6 py-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#D4AF37]">
              Pre-Consultation Assessment
            </span>
            <h3 className="text-xl font-bold font-serif">Clinical Symptom Evaluation</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8">
          {!completed ? (
            <div>
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center text-xs text-slate-500 mb-2 font-medium">
                  <span>Question {currentStep + 1} of {TRIAGE_QUESTIONS.length}</span>
                  <span>{Math.round(((currentStep + 1) / TRIAGE_QUESTIONS.length) * 100)}% Complete</span>
                </div>
                <div className="w-full h-1.5 bg-[#E8EFE9] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1D4D43] transition-all duration-300 rounded-full"
                    style={{ width: `${((currentStep + 1) / TRIAGE_QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-[#1B2A26] mb-1">
                  {currentQ.question}
                </h4>
                <p className="text-xs text-slate-500">
                  {currentQ.description}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5 mb-8">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedAnswers[currentQ.id] === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#1D4D43] bg-[#F0F5F1] text-[#1D4D43] shadow-xs'
                          : 'border-slate-200 bg-white hover:border-[#A3BFAB] hover:bg-[#FBFBF9] text-slate-700'
                      }`}
                    >
                      <span>{opt.label}</span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                        isSelected ? 'border-[#1D4D43] bg-[#1D4D43] text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    currentStep === 0
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={selectedAnswers[currentQ.id] === undefined}
                  className={`inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold rounded-xl text-white transition-all shadow-xs ${
                    selectedAnswers[currentQ.id] === undefined
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-[#1D4D43] hover:bg-[#163D35]'
                  }`}
                >
                  <span>{currentStep === TRIAGE_QUESTIONS.length - 1 ? 'View Assessment' : 'Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Result View */
            <div className="space-y-6 animate-in fade-in">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#E8EFE9] text-[#1D4D43] flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold font-serif text-[#1B2A26]">Assessment Complete</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Based on your responses, an evidence-based constitutional homoeopathic intake is recommended.
                </p>
              </div>

              {/* Recommended Focus Card */}
              <div className="p-4 rounded-xl bg-[#F0F5F1] border border-[#CCD8CF] space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#1D4D43]">
                  <span>Matched Clinical Focus</span>
                  <span className="uppercase tracking-wider text-[10px] bg-white px-2 py-0.5 rounded-md border border-[#CCD8CF]">
                    {resolvedCategory.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Your symptoms suggest an individualized case analysis focusing on constitutional triggers, metabolic equilibrium, and holistic lifestyle alignment.
                </p>
              </div>

              {/* Medically Responsible Disclaimer */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  <strong>Medical Disclaimer:</strong> This self-evaluation is an educational intake guide, not a formal medical diagnosis. No guarantees of cure are made. Always undergo appropriate clinical and laboratory evaluations.
                </span>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onProceedToBooking(resolvedCategory, triageSummaryNotes);
                    onClose();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#1D4D43] hover:bg-[#163D35] text-white text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Book Consultation With This Assessment</span>
                </button>
                <button
                  type="button"
                  onClick={resetTriage}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake Assessment</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
