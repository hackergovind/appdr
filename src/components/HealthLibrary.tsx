import React, { useState } from 'react';
import { 
  Search, BookOpen, Clock, ArrowRight, Share2, ArrowLeft, ShieldCheck, 
  Activity, CheckCircle2, AlertCircle, RefreshCw, FileText, Sparkles, MessageCircle, Calendar
} from 'lucide-react';
import { Article, ConsultationCategory } from '../types';
import { DOCTOR_PROFILE } from '../data/defaultData';

interface HealthLibraryProps {
  articles: Article[];
  onBookCategory: (category: ConsultationCategory, notes?: string) => void;
}

type LibraryTab = 'articles' | 'symptom_triage';

interface AssessmentQuestion {
  id: string;
  question: string;
  options: { label: string; points: number }[];
}

const ASSESSMENT_MODULES: Record<string, {
  title: string;
  category: ConsultationCategory;
  subtitle: string;
  recommendedLabs: string[];
  clinicalNote: string;
  questions: AssessmentQuestion[];
}> = {
  thyroid: {
    title: "Thyroid & Metabolic Sluggishness Evaluator",
    category: "thyroid_care",
    subtitle: "Evaluates thermal tolerance, energy dips, fluid retention, and thyroid-metabolic indicators.",
    recommendedLabs: ["Complete Thyroid Panel (TSH, Free T3, Free T4)", "Anti-TPO Antibodies", "Serum Ferritin & Vitamin D3"],
    clinicalNote: "In evidence-based homoeopathy, subclinical thyroid sluggishness is evaluated through thermal sensitivities, constitutional vitality, and systemic metabolism alongside standard lab markers.",
    questions: [
      {
        id: "t_cold",
        question: "How is your temperature preference and sensitivity to cold?",
        options: [
          { label: "Normal thermal comfort throughout the year", points: 0 },
          { label: "Frequently feel chilly when others are comfortable", points: 2 },
          { label: "Extreme cold intolerance; icy extremities and sluggish mornings", points: 3 },
        ]
      },
      {
        id: "t_energy",
        question: "How do you describe your daily energy and mental focus?",
        options: [
          { label: "Steady energy with good mental clarity", points: 0 },
          { label: "Afternoon energy crash with brain fog and sluggish recall", points: 2 },
          { label: "Wake up unrefreshed despite 8+ hours sleep; constant exhaustion", points: 3 },
        ]
      },
      {
        id: "t_metabolism",
        question: "Any unexplained changes in weight, digestion, or hair texture?",
        options: [
          { label: "Stable weight and regular daily bowel movements", points: 0 },
          { label: "Tendency toward dry skin, sluggish bowels, or mild hair shedding", points: 2 },
          { label: "Persistent weight resistance, chronic constipation, diffuse hair thinning", points: 3 },
        ]
      }
    ]
  },
  hormonal_pcos: {
    title: "Hormonal & PCOS Symptom Screener",
    category: "hormonal_balance",
    subtitle: "Screens for menstrual cycle regularity, androgenic markers, and insulin sensitivity signals.",
    recommendedLabs: ["Pelvic Ultrasound (USG)", "Fasting Insulin & Glucose", "Serum LH & FSH (Day 2/3)", "Serum AMH"],
    clinicalNote: "Homoeopathy evaluates menstrual totality, emotional-hormonal triggers, and metabolic equilibrium rather than merely using hormonal suppressive therapies.",
    questions: [
      {
        id: "h_cycle",
        question: "How predictable and regular are your menstrual cycles?",
        options: [
          { label: "Regular 26–32 day cycles with normal flow", points: 0 },
          { label: "Occasional delays (35–45 days) or painful periods", points: 2 },
          { label: "Highly irregular (>45 days), absent for months, or requires medicine to induce", points: 3 },
        ]
      },
      {
        id: "h_androgen",
        question: "Have you noticed androgen-related symptoms (acne, hair thinning, or facial hair)?",
        options: [
          { label: "No significant skin or hair concerns", points: 0 },
          { label: "Mild cyclical jawline acne or slight facial hair", points: 2 },
          { label: "Persistent cystic acne, hirsutism, or noticeable scalp thinning", points: 3 },
        ]
      },
      {
        id: "h_metabolism",
        question: "Do you experience severe sugar cravings or abdominal weight concentration?",
        options: [
          { label: "Rarely; balanced appetite and satiety", points: 0 },
          { label: "Frequent cravings for sweets/carbs after meals", points: 2 },
          { label: "Intense afternoon sugar crashes, difficulty shedding midsection weight", points: 3 },
        ]
      }
    ]
  },
  joint_mobility: {
    title: "Musculoskeletal Joint Pain & Stiffness Index",
    category: "joint_wellness",
    subtitle: "Analyzes pain modalities, weather sensitivity, morning stiffness, and daily functional mobility.",
    recommendedLabs: ["Serum Uric Acid", "Erythrocyte Sedimentation Rate (ESR)", "hs-CRP", "Rheumatoid Factor (RF)"],
    clinicalNote: "Homoeopathic prescribing in joint disorders depends crucially on 'modalities'—whether pain improves with gentle movement, heat, or complete rest.",
    questions: [
      {
        id: "j_stiffness",
        question: "How long does your morning joint stiffness typically last?",
        options: [
          { label: "No morning stiffness; full ease of movement", points: 0 },
          { label: "Brief stiffness (<15 minutes) that eases with movement", points: 2 },
          { label: "Prolonged morning stiffness (>30 minutes) or pain during first steps", points: 3 },
        ]
      },
      {
        id: "j_weather",
        question: "Does your pain change with weather changes (damp, cold, or rainy seasons)?",
        options: [
          { label: "Weather does not seem to influence the pain", points: 0 },
          { label: "Moderate increase in aches during monsoon or winter cold", points: 2 },
          { label: "Noticeably aggravated before rainfall, barometric drops, or chilly drafts", points: 3 },
        ]
      },
      {
        id: "j_modality",
        question: "What relieves your discomfort the most?",
        options: [
          { label: "Not applicable / aches resolve quickly", points: 0 },
          { label: "Warm baths, gentle continued walking, or heating pad", points: 2 },
          { label: "Absolute rest, firmness, and cool air (worse from slightest motion)", points: 3 },
        ]
      }
    ]
  }
};

export const HealthLibrary: React.FC<HealthLibraryProps> = ({
  articles,
  onBookCategory,
}) => {
  const [activeMainTab, setActiveMainTab] = useState<LibraryTab>('articles');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  // Interactive Assessment states
  const [selectedModule, setSelectedModule] = useState<'thyroid' | 'hormonal_pcos' | 'joint_mobility'>('thyroid');
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, number>>({});
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);

  const categories = [
    { id: 'all', label: 'All Articles' },
    { id: 'thyroid', label: 'Thyroid Health' },
    { id: 'hormonal_pcos', label: 'PCOS & Hormones' },
    { id: 'joint_pain', label: 'Joint Mobility' },
    { id: 'hair_wellness', label: 'Hair & Vitality' },
    { id: 'preventive', label: 'Preventive Care' },
  ];

  const filteredArticles = articles.filter(art => {
    const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;
    const matchesSearch = 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleShareWhatsApp = (art: Article) => {
    const text = encodeURIComponent(
      `Read this health guide by Dr. Harshika Singh, BHMS, MD (Hom.):\n\n*${art.title}*\n${art.summary}\n\nEvidence-based Homoeopathy: https://www.drharshika.in`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const mapArticleCategoryToBooking = (cat: Article['category']): ConsultationCategory => {
    switch (cat) {
      case 'thyroid': return 'thyroid_care';
      case 'hormonal_pcos': return 'hormonal_balance';
      case 'joint_pain': return 'joint_wellness';
      case 'hair_wellness': return 'hair_fall';
      default: return 'general_wellness';
    }
  };

  // Assessment logic
  const currentModuleData = ASSESSMENT_MODULES[selectedModule];
  const allAnswered = currentModuleData.questions.every(q => assessmentAnswers[q.id] !== undefined);

  const calculateScore = () => {
    let total = 0;
    currentModuleData.questions.forEach(q => {
      const optIdx = assessmentAnswers[q.id];
      if (optIdx !== undefined) {
        total += q.options[optIdx]?.points || 0;
      }
    });
    return total;
  };

  const totalScore = calculateScore();
  const maxPossibleScore = currentModuleData.questions.length * 3;

  const getScoreVerdict = () => {
    const ratio = totalScore / maxPossibleScore;
    if (ratio >= 0.6) {
      return {
        level: "High Constitutional Indication",
        desc: "Your responses suggest marked chronic symptom persistence. A detailed constitutional homoeopathic intake with lab test review is strongly advised.",
        badgeColor: "bg-rose-100 text-rose-800 border-rose-300"
      };
    } else if (ratio >= 0.3) {
      return {
        level: "Moderate Metabolic / Hormonal Imbalance",
        desc: "Mild to moderate systemic indicators observed. Early constitutional lifestyle and homeopathic care can help prevent disease progression.",
        badgeColor: "bg-amber-100 text-amber-800 border-amber-300"
      };
    }
    return {
      level: "Mild / Subclinical Presentation",
      desc: "Low symptom severity. Preventive lifestyle habits, dietary co-factors, and monitoring are recommended.",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300"
    };
  };

  const handleTransferToBooking = () => {
    const summaryText = `Interactive Clinical Assessment (${currentModuleData.title}):\nScore: ${totalScore}/${maxPossibleScore} (${getScoreVerdict().level})\n\nAnswers:\n${currentModuleData.questions.map(q => {
      const ansIdx = assessmentAnswers[q.id] ?? 0;
      return `- ${q.question}: ${q.options[ansIdx]?.label}`;
    }).join('\n')}`;

    onBookCategory(currentModuleData.category, summaryText);
  };

  const handleShareAssessmentWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello Dr. Harshika Singh,\n\nI completed your *${currentModuleData.title}* on drharshika.in.\n*Result:* ${getScoreVerdict().level} (Score: ${totalScore}/${maxPossibleScore})\n\nI would like to discuss this in an online consultation.`
    );
    window.open(`https://wa.me/${DOCTOR_PROFILE.whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="py-8 px-4 sm:px-6 max-w-5xl mx-auto space-y-8">
      
      {/* If reading single article */}
      {activeArticle ? (
        <div className="bg-white rounded-2xl border border-[#CCD8CF] p-6 md:p-10 shadow-xs space-y-8 animate-in fade-in">
          <button
            type="button"
            onClick={() => setActiveArticle(null)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#1D4D43] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Health Library</span>
          </button>

          <div className="space-y-3 border-b border-slate-100 pb-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="uppercase font-semibold tracking-wider text-[#1D4D43]">
                {activeArticle.category.replace('_', ' ')}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {activeArticle.readTime}
              </span>
              <span>·</span>
              <span>{activeArticle.publishedAt}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold font-serif text-[#1B2A26] leading-tight">
              {activeArticle.title}
            </h1>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-600">
                By <strong>{activeArticle.author}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleShareWhatsApp(activeArticle)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share on WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                >
                  {copiedShare ? 'Copied' : 'Copy Link'}
                </button>
              </div>
            </div>
          </div>

          {activeArticle.evidencePoints && activeArticle.evidencePoints.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#F0F5F1] border border-[#CCD8CF] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1D4D43]">
                <ShieldCheck className="w-4 h-4" />
                <span>Clinical Insights &amp; Established Evidence</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {activeArticle.evidencePoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D4D43] mt-1.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed space-y-4">
            {activeArticle.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 leading-relaxed">
            <strong>Medical Responsibility Notice:</strong> This article is authored for patient educational purposes and reflects evidence-informed homoeopathic clinical perspectives. It is not intended to substitute for individualized diagnostic evaluation or emergency care.
          </div>

          <div className="p-6 rounded-2xl bg-[#1D4D43] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold font-serif">Have questions regarding this condition?</h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                Schedule a one-on-one constitutional case intake with Dr. Harshika Singh.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onBookCategory(mapArticleCategoryToBooking(activeArticle.category))}
              className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#BFA15F] text-[#1B2A26] font-bold text-xs whitespace-nowrap transition-colors shadow-sm"
            >
              Book Consultation Slot
            </button>
          </div>
        </div>
      ) : (
        /* Library Index View */
        <div className="space-y-8">
          {/* Header */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1D4D43]">
              Health Education &amp; Self-Evaluation
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#1B2A26] mt-1">
              Evidence-Based Homoeopathy Knowledge Centre
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Medically grounded health guides and interactive clinical symptom evaluators authored by Dr. Harshika Singh, BHMS, MD (Hom.).
            </p>
          </div>

          {/* Primary View Toggle: Educational Articles vs Interactive Symptom Assessment */}
          <div className="p-1 rounded-xl bg-[#E8EFE9] border border-[#CCD8CF] flex items-center max-w-md">
            <button
              type="button"
              onClick={() => setActiveMainTab('articles')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeMainTab === 'articles'
                  ? 'bg-white text-[#1D4D43] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Health Articles ({articles.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMainTab('symptom_triage')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeMainTab === 'symptom_triage'
                  ? 'bg-[#1D4D43] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Interactive Symptom Evaluation</span>
            </button>
          </div>

          {/* VIEW A: Educational Articles */}
          {activeMainTab === 'articles' && (
            <div className="space-y-6">
              {/* Search & Category Tabs */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles on thyroid, PCOS, joint pain, hair fall..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#1D4D43]"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-[#1D4D43] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-[#F0F5F1]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Articles */}
              {filteredArticles.length === 0 ? (
                <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 p-8">
                  <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No articles match your search</p>
                  <p className="text-xs text-slate-400 mt-1">Try keywords like "thyroid", "PCOS", or "joint pain".</p>
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-[#1D4D43] bg-[#E8EFE9] rounded-lg hover:bg-[#DDE6E0]"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredArticles.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => setActiveArticle(art)}
                      className="group bg-white rounded-2xl border border-[#CCD8CF] hover:border-[#1D4D43] p-6 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="uppercase font-semibold tracking-wider text-[#1D4D43] text-[10px]">
                            {art.category.replace('_', ' ')}
                          </span>
                          <span className="flex items-center gap-1 text-[11px]">
                            <Clock className="w-3 h-3" />
                            {art.readTime}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold font-serif text-[#1B2A26] group-hover:text-[#1D4D43] transition-colors leading-snug">
                          {art.title}
                        </h3>

                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {art.summary}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400">{art.publishedAt}</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-[#1D4D43] group-hover:translate-x-0.5 transition-transform">
                          <span>Read Guide</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW B: Interactive Clinical Symptom Evaluation Suite */}
          {activeMainTab === 'symptom_triage' && (
            <div className="space-y-6">
              {/* Module Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedModule('thyroid');
                    setAssessmentAnswers({});
                    setAssessmentCompleted(false);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    selectedModule === 'thyroid'
                      ? 'border-[#1D4D43] bg-white shadow-sm ring-2 ring-[#1D4D43]'
                      : 'border-[#CCD8CF] bg-white hover:bg-[#F0F5F1]'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37]">
                    Clinical Focus 1
                  </span>
                  <h4 className="text-sm font-bold font-serif text-[#1B2A26] mt-0.5">
                    Thyroid &amp; Metabolism
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    Cold intolerance, afternoon energy dips, and thyroid sluggishness.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedModule('hormonal_pcos');
                    setAssessmentAnswers({});
                    setAssessmentCompleted(false);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    selectedModule === 'hormonal_pcos'
                      ? 'border-[#1D4D43] bg-white shadow-sm ring-2 ring-[#1D4D43]'
                      : 'border-[#CCD8CF] bg-white hover:bg-[#F0F5F1]'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37]">
                    Clinical Focus 2
                  </span>
                  <h4 className="text-sm font-bold font-serif text-[#1B2A26] mt-0.5">
                    PCOS &amp; Hormonal Balance
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    Cycle regularity, androgen acne, and insulin resistance signs.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedModule('joint_mobility');
                    setAssessmentAnswers({});
                    setAssessmentCompleted(false);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    selectedModule === 'joint_mobility'
                      ? 'border-[#1D4D43] bg-white shadow-sm ring-2 ring-[#1D4D43]'
                      : 'border-[#CCD8CF] bg-white hover:bg-[#F0F5F1]'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37]">
                    Clinical Focus 3
                  </span>
                  <h4 className="text-sm font-bold font-serif text-[#1B2A26] mt-0.5">
                    Joint Pain &amp; Mobility
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    Morning stiffness duration, weather modalities, and motion comfort.
                  </p>
                </button>
              </div>

              {/* Assessment Card */}
              <div className="bg-white rounded-3xl border border-[#CCD8CF] p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1D4D43] bg-[#E8EFE9] px-2.5 py-0.5 rounded-md">
                      Interactive Clinical Assessment
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#1B2A26] mt-2">
                    {currentModuleData.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {currentModuleData.subtitle}
                  </p>
                </div>

                {!assessmentCompleted ? (
                  <div className="space-y-6">
                    {currentModuleData.questions.map((q, qIndex) => (
                      <div key={q.id} className="p-4 rounded-2xl bg-[#FBFBF9] border border-slate-200 space-y-3">
                        <div className="text-xs font-bold text-slate-800 flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#1D4D43] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-sans">
                            {qIndex + 1}
                          </span>
                          <span>{q.question}</span>
                        </div>

                        <div className="space-y-2 pl-7">
                          {q.options.map((opt, optIndex) => {
                            const isSelected = assessmentAnswers[q.id] === optIndex;
                            return (
                              <button
                                key={optIndex}
                                type="button"
                                onClick={() => setAssessmentAnswers(prev => ({ ...prev, [q.id]: optIndex }))}
                                className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                                  isSelected
                                    ? 'border-[#1D4D43] bg-[#F0F5F1] text-[#1D4D43] shadow-xs'
                                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                                }`}
                              >
                                <span>{opt.label}</span>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                                  isSelected ? 'border-[#1D4D43] bg-[#1D4D43] text-white' : 'border-slate-300'
                                }`}>
                                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        disabled={!allAnswered}
                        onClick={() => setAssessmentCompleted(true)}
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold tracking-wide text-white transition-all shadow-sm ${
                          !allAnswered
                            ? 'bg-slate-300 cursor-not-allowed'
                            : 'bg-[#1D4D43] hover:bg-[#163D35]'
                        }`}
                      >
                        <span>Calculate Clinical Summary</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Assessment Results View */
                  <div className="space-y-6 animate-in fade-in">
                    <div className="p-5 rounded-2xl bg-[#F0F5F1] border border-[#CCD8CF] space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#1D4D43] uppercase tracking-wider">
                          Evaluation Analysis
                        </span>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getScoreVerdict().badgeColor}`}>
                          {getScoreVerdict().level} (Score: {totalScore} / {maxPossibleScore})
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {getScoreVerdict().desc}
                      </p>
                    </div>

                    {/* Recommended Pre-Consultation Investigations */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#1B2A26] uppercase tracking-wider">
                        <FileText className="w-4 h-4 text-[#1D4D43]" />
                        <span>Recommended Diagnostic Tests to Keep Ready</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {currentModuleData.recommendedLabs.map((lab, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 rounded-lg bg-[#F8FAF8] border border-[#CCD8CF] text-xs font-semibold text-slate-800"
                          >
                            {lab}
                          </span>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        You can upload recent lab reports directly in your Patient Portal prior to your appointment.
                      </p>
                    </div>

                    {/* Medical Ethics Notice */}
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <span>
                        <strong>Medical Note:</strong> This self-assessment is an educational triage tool, not a diagnostic certainty. Dr. Harshika Singh conducts detailed individual case analysis under ethical homoeopathic standards.
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <button
                        type="button"
                        onClick={handleTransferToBooking}
                        className="flex-1 py-3 px-4 rounded-xl bg-[#1D4D43] hover:bg-[#163D35] text-white text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        <Calendar className="w-4 h-4 text-[#D4AF37]" />
                        <span>Book Online Consultation With This Assessment</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleShareAssessmentWhatsApp}
                        className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Share on WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAssessmentAnswers({});
                          setAssessmentCompleted(false);
                        }}
                        className="py-3 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retake</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
