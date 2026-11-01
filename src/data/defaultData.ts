import { Article, ClinicSettings } from '../types';

export const DOCTOR_PROFILE = {
  name: "Dr. Harshika Singh",
  qualifications: "BHMS, MD (Hom.)",
  brandTitle: "Dr. Harshika | Wellness & Homoeopathy",
  tagline: "Evidence-Based Homoeopathy",
  clinicalFocus: "Hormonal Balance, Thyroid Care & Joint Wellness",
  consultations: "Online Consultations Across India",
  experienceYears: "5+ Years Clinical Practice",
  clinicPhone: "+91 80102 81579",
  whatsappNumber: "918010281579",
  clinicEmail: "harshikasingh631999@gmail.com",
  website: "https://www.drharshika.in",
  registrationNote: "Registered Homeopathic Physician. Practicing in strict adherence to National Commission for Homoeopathy ethical guidelines.",
};

export const CLINICAL_FOCUS_PILLARS = [
  {
    id: "hormonal_balance",
    title: "Hormonal Health & PCOS",
    summary: "Systemic, root-cause homeopathic evaluation addressing irregular cycles, androgen imbalance, metabolic resistance, and mood fluctuations without synthetic hormones.",
    keyPoints: [
      "Individualized constitutional case analysis",
      "Assessment of sleep, insulin sensitivity, and stress markers",
      "Gentle cycle regulation aiming for sustainable ovulation",
      "Non-habit forming, holistic supportive care"
    ],
    recommendedTests: ["Fasting Insulin", "LH/FSH Ratio", "Pelvic Ultrasound", "Serum AMH"],
  },
  {
    id: "thyroid_care",
    title: "Thyroid & Metabolic Wellness",
    summary: "Comprehensive constitutional support for subclinical hypothyroidism, Hashimoto's autoimmunity, sluggish metabolism, cold sensitivity, and thyroid-related fatigue.",
    keyPoints: [
      "Complementary care evaluated alongside TSH, Free T3, and Free T4",
      "Addressing energy dips, fluid retention, and brain fog",
      "Never advises abrupt cessation of prescribed thyroid hormones",
      "Focus on systemic vitality and immune stabilization"
    ],
    recommendedTests: ["Complete Thyroid Profile (TSH, FT3, FT4)", "Anti-TPO Antibodies", "Vitamin D3 & B12"],
  },
  {
    id: "joint_wellness",
    title: "Joint Pain & Mobility Care",
    summary: "Targeted homoeopathic therapeutics for chronic musculoskeletal aches, morning stiffness, uric acid diathesis, and repetitive strain discomfort.",
    keyPoints: [
      "Modalities-based assessment (weather sensitivity, motion vs rest)",
      "Gentle anti-inflammatory support with zero gastrointestinal irritation",
      "Preservation of flexibility and daily active mobility",
      "Guidance on anti-inflammatory diet and joint ergonomics"
    ],
    recommendedTests: ["Serum Uric Acid", "ESR / hs-CRP", "Rheumatoid Factor (RF) if indicated"],
  },
  {
    id: "hair_wellness",
    title: "Hair Fall & Vitality",
    summary: "Investigating the internal triggers behind chronic diffuse hair thinning, stress-induced telogen effluvium, and postpartum or post-illness shedding.",
    keyPoints: [
      "Correlation with ferritin, thyroid, and chronic stress",
      "Constitutional medicines to improve follicular vitality",
      "Comprehensive scalp hygiene and nutritional counseling"
    ],
    recommendedTests: ["Serum Ferritin", "Complete Hemogram", "TSH"],
  }
];

export const DEFAULT_CLINIC_SETTINGS: ClinicSettings = {
  consultationFee: 799,
  followupFee: 499,
  upiId: "drharshika@upi",
  clinicPhone: "+91 80102 81579",
  clinicEmail: "harshikasingh631999@gmail.com",
  daysActive: "Monday to Saturday (10:00 AM - 07:00 PM IST)",
  bookingEnabled: true,
  announcement: "Online video & voice consultations are available across India. Prescriptions and courier details provided post-consultation.",
};

export const DEFAULT_ARTICLES: Article[] = [
  {
    id: "art_thyroid_fatigue",
    title: "Understanding Hypothyroidism Beyond the TSH Number: A Holistic Perspective",
    slug: "understanding-hypothyroidism-beyond-tsh",
    category: "thyroid",
    summary: "Why many individuals still experience fatigue, brain fog, and weight resistance despite normal TSH levels, and how constitutional homoeopathy supports overall vitality.",
    readTime: "5 min read",
    isPublished: true,
    author: "Dr. Harshika Singh, BHMS, MD (Hom.)",
    publishedAt: "October 2026",
    evidencePoints: [
      "TSH evaluates pituitary signaling, but tissue-level metabolic response requires cellular vitality.",
      "Nutrient co-factors such as selenium, zinc, and vitamin D play vital roles in peripheral hormone conversion.",
      "Homoeopathy evaluates systemic miasmatic disposition and mental-emotional stress triggers."
    ],
    content: `Hypothyroidism is frequently managed through standard replacement therapy, yet a substantial cohort of patients continues to experience persistent fatigue, dry skin, constipation, and unrefreshing sleep. In homoeopathic clinical evaluation, we view the endocrine axis as part of an integrated, bio-dynamic organism.

Rather than treating the thyroid gland in isolation, constitutional homoeopathic care looks into personal thermal preferences, stress response patterns, emotional triggers, and hereditary tendencies. 

**Important Clinical Clarification**: Homeopathic support is administered in conjunction with standard lab monitoring. Patients on prescribed levothyroxine must never stop their medication abruptly. The goal of holistic management is to enhance cellular vitality and address the systemic terrain, with any medical dosage adjustments performed strictly under appropriate medical evaluation.`
  },
  {
    id: "art_pcos_root_cause",
    title: "PCOS & Irregular Cycles: Moving from Symptom Suppression to Root-Cause Care",
    slug: "pcos-irregular-cycles-root-cause-care",
    category: "hormonal_pcos",
    summary: "Exploring the hormonal-metabolic continuum in Polycystic Ovarian Syndrome and how individualized homoeopathy addresses underlying systemic dysregulation.",
    readTime: "6 min read",
    isPublished: true,
    author: "Dr. Harshika Singh, BHMS, MD (Hom.)",
    publishedAt: "October 2026",
    evidencePoints: [
      "PCOS is a multi-system metabolic and endocrine condition, not merely a gynecological issue.",
      "Insulin resistance and hyperandrogenism interact with chronic low-grade inflammation.",
      "Evidence-based homoeopathy utilizes individualized constitutional prescriptions rather than generic remedies."
    ],
    content: `Polycystic Ovarian Syndrome (PCOS) affects millions of women across India, frequently accompanied by irregular or delayed menstruation, androgen excess (acne, hirsutism), and metabolic fatigue. 

While temporary withdrawal bleeding can be induced chemically, restoring spontaneous, rhythmic ovulation requires addressing the systemic hormonal baseline. 

In evidence-based homoeopathy, remedies are matched strictly to the patient's individual totality—considering menstrual history, dietary cravings, thermal state, and mental disposition. Along with low-glycemic dietary modifications and restorative sleep patterns, homoeopathic constitutional care supports the hypothalamic-pituitary-ovarian axis in regaining natural physiological rhythm.`
  },
  {
    id: "art_joint_pain_weather",
    title: "Joint Stiffness & Weather Sensitivity: Understanding Homoeopathic Modalities",
    slug: "joint-stiffness-weather-sensitivity-modalities",
    category: "joint_pain",
    summary: "Why joint aches often intensify in damp cold or rainy weather, and how individual symptom modalities guide precise homeopathic medicine selection.",
    readTime: "4 min read",
    isPublished: true,
    author: "Dr. Harshika Singh, BHMS, MD (Hom.)",
    publishedAt: "September 2026",
    evidencePoints: [
      "Barometric pressure shifts influence synovial capsule pressure in arthritic joints.",
      "Homoeopathic repertorization relies on individual modalities (worse cold, better gentle motion, etc.).",
      "Provides gentle musculoskeletal comfort without gastric irritation or kidney load."
    ],
    content: `A hallmark of homoeopathic medicine is its rigorous attention to symptom 'modalities'—the exact circumstances that alleviate or aggravate a person's pain. Two patients diagnosed with joint stiffness may experience completely opposite relief: one feels markedly improved with continuous warm motion, while the other requires absolute immobility and cool compresses.

Homoeopathic remedies such as Bryonia, Rhus Tox, or Causticum are never prescribed blindly based on diagnostic labels alone; they are chosen only when the totality of symptoms matches the individual's unique presentation.

**Clinical Tip**: Regular low-impact movement (such as gentle walking or swimming) coupled with adequate hydration helps maintain synovial joint lubrication and supports long-term mobility.`
  },
  {
    id: "art_hair_fall_deficiencies",
    title: "Diffuse Hair Thinning: When Shampoos Are Not the Solution",
    slug: "diffuse-hair-thinning-nutritional-and-hormonal-links",
    category: "hair_wellness",
    summary: "Investigating why telogen effluvium is rooted in internal metabolic imbalances, ferritin deficiency, or thyroid fluctuations rather than topical products.",
    readTime: "4 min read",
    isPublished: true,
    author: "Dr. Harshika Singh, BHMS, MD (Hom.)",
    publishedAt: "August 2026",
    evidencePoints: [
      "Hair follicles are sensitive indicators of systemic metabolic stress and ferritin reserves.",
      "Post-illness or postpartum shedding typically reflects an internal physiological trigger 2–3 months earlier.",
      "Constitutional homeopathic care targets the internal root cause rather than cosmetic masking."
    ],
    content: `Sudden or persistent hair loss is one of the most common reasons patients seek consultation. Many individuals cycle through costly topical serums without investigating their underlying blood markers.

In clinical practice, diffuse thinning is frequently secondary to subclinical iron deficiency (low ferritin), subclinical hypothyroidism, or severe psychological stress. By conducting an individualized intake and reviewing essential blood parameters, Dr. Harshika's consultation aims to stabilize the systemic root cause while promoting cellular recovery.`
  }
];

export const CONSULTATION_STEPS = [
  {
    step: "01",
    title: "Book Online Slot",
    desc: "Select your preferred date, convenient morning or evening time slot, and submit your chief health complaints."
  },
  {
    step: "02",
    title: "Detailed Clinical Intake",
    desc: "Complete a structured intake assessing past medical records, family history, thermal preferences, and lifestyle factors."
  },
  {
    step: "03",
    title: "One-on-One Doctor Video/Call",
    desc: "Connect directly with Dr. Harshika Singh for a detailed 30–45 minute consultation exploring the totality of your symptoms."
  },
  {
    step: "04",
    title: "Digital Prescription & Care",
    desc: "Receive your verified digital prescription, dietary guidelines, and medicine delivery support across India."
  }
];

export const CLINIC_FAQS = [
  {
    question: "How do online homoeopathic consultations work across India?",
    answer: "Online consultations are conducted via secure high-definition video or voice call. After booking your appointment, you will receive confirmation and meeting access details. Dr. Harshika will conduct an in-depth case intake covering your chief complaints, medical history, and constitutional markers."
  },
  {
    question: "Can I take homoeopathy alongside my prescribed thyroid or conventional medication?",
    answer: "Yes. Homoeopathic constitutional care can safely run alongside prescribed conventional medications. You must never discontinue or alter allopathic medicines (such as thyroid hormone replacement or blood pressure medication) without explicit evaluation by your treating physician."
  },
  {
    question: "What medical reports or test results should I prepare?",
    answer: "Please have your recent blood investigations ready (for instance: Complete Thyroid Panel TSH/FT3/FT4, HbA1c, Pelvic Ultrasound for PCOS, or Uric Acid for joint issues). You can securely upload these through your Patient Portal before your consultation."
  },
  {
    question: "How are homoeopathic medicines delivered to my location?",
    answer: "Following your consultation, you will receive a digital prescription. Patients within India may opt for genuine homoeopathic formulations dispatched securely to their doorstep, or obtain them from a registered homeopathic pharmacy using the digital prescription."
  },
  {
    question: "Do you guarantee cures for chronic illnesses?",
    answer: "No. Ethical medical practice strictly prohibits guaranteed-cure claims. Healing timelines depend on disease chronicity, individual constitutional vitality, lifestyle adherence, and systemic pathology. Dr. Harshika adheres strictly to evidence-based homoeopathy and professional medical ethics."
  }
];
