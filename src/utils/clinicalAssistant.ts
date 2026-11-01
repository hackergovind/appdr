export const CLINICAL_SYSTEM_INSTRUCTION = `You are the official Clinical Assistant and Virtual Desk for Dr. Harshika Singh's practice — Dr. Harshika | Wellness & Homoeopathy (website: drharshika.in).

About Dr. Harshika Singh:
- Qualifications: BHMS, MD (Hom.)
- Practice Tagline: Evidence-Based Homoeopathy
- Clinical Focus Areas: Hormonal Balance & PCOS, Thyroid & Metabolic Care, Joint Mobility & Pain, and Hair Fall & Vitality.
- Consultations: Online video and voice consultations conducted across all states in India. Authentic homoeopathic medicine courier delivery available post-consultation.
- Consultation Fees: ₹799 for new patient consultation (30–45 mins in-depth constitutional intake); ₹499 for follow-up review.
- Clinic WhatsApp Desk: +91 80102 81579. Official Website: https://www.drharshika.in.

Strict Medical Ethics & Guidelines:
1. Never describe Dr. Harshika as an allopathic 'specialist'; she is a registered homeopathic physician practicing constitutional homeopathy.
2. Never make guaranteed-cure claims or promise miraculous quick fixes.
3. If asked about taking homoeopathic remedies alongside allopathic drugs (such as Levothyroxine for thyroid, metformin, or BP medications): explain clearly that constitutional homoeopathy can safely run alongside conventional treatments, and the patient must NEVER discontinue or reduce prescribed allopathic medication without consulting their treating doctor.
4. Explain the online consultation process: (1) Book slot, (2) Complete clinical intake & upload reports, (3) 1-on-1 video/voice call with Dr. Harshika, (4) Digital prescription & medicine courier.
5. Offer to guide them to click "Book an Appointment" or try the "Clinical Symptom Evaluation" in the app.
6. Keep tone warm, empathetic, respectful, concise, and professional.`;

export function getClinicalFallbackResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('thyroid') || q.includes('tsh') || q.includes('hypothyroid') || q.includes('weight') || q.includes('metabolism')) {
    return `In Dr. Harshika Singh's practice, thyroid care goes beyond just the TSH number. We evaluate systemic vitality, thermal sensitivities (cold intolerance), afternoon energy dips, and metabolic resistance.

• **Conventional Medication**: If you are on prescribed thyroid medicine (e.g. Thyronorm/Eltroxin), you should continue it as prescribed. Homeopathy works safely alongside allopathy without interference.
• **Recommended Investigations**: Complete Thyroid Profile (TSH, FT3, FT4), Anti-TPO, and Ferritin.

Would you like to book a 30–45 min online consultation with Dr. Harshika (₹799)? You can also take the interactive Thyroid assessment in the Health Library.`;
  }

  if (q.includes('pcos') || q.includes('pcod') || q.includes('period') || q.includes('cycle') || q.includes('hormon') || q.includes('acne') || q.includes('menses')) {
    return `Dr. Harshika Singh focuses on root-cause constitutional care for PCOS and hormonal irregularities. Rather than temporary hormone suppression, constitutional homeopathy aims to support natural physiological ovulation by evaluating menstrual history, insulin resistance markers, and emotional-hormonal triggers.

• **Investigations to Keep Ready**: Pelvic Ultrasound (USG), Fasting Insulin, and LH/FSH ratio.
• **Consultation Mode**: One-on-one video/call across India with medicine courier support.

Click "Book an Appointment" to reserve your convenient morning or evening slot.`;
  }

  if (q.includes('joint') || q.includes('pain') || q.includes('stiff') || q.includes('arthritis') || q.includes('uric') || q.includes('knee') || q.includes('back')) {
    return `For chronic joint discomfort and morning stiffness, Dr. Harshika evaluates individualized 'modalities'—such as how your pain responds to weather shifts (damp cold vs warm dry) and gentle motion versus rest.

Homoeopathic remedies provide gentle anti-inflammatory support without gastrointestinal irritation. You may keep Serum Uric Acid and ESR/CRP reports ready for review during your online session.`;
  }

  if (q.includes('fee') || q.includes('cost') || q.includes('charge') || q.includes('price') || q.includes('rupee') || q.includes('₹') || q.includes('fees')) {
    return `Dr. Harshika Singh's consultation fees are transparent:
• **New Patient Consultation**: ₹799 (Detailed 30–45 mins case evaluation)
• **Follow-Up Review**: ₹499

Payment can be settled via UPI (drharshika@upi) or online gateway. Official invoice receipts are provided in your Patient Portal.`;
  }

  if (q.includes('allopath') || q.includes('other medicine') || q.includes('together') || q.includes('stop') || q.includes('side effect')) {
    return `Yes, homoeopathic constitutional care can safely run alongside prescribed conventional (allopathic) medications.

⚠️ **Important Medical Advice**: You must never abruptly discontinue or reduce prescribed medicines (such as thyroid hormone, blood pressure tablets, or diabetes medications) without explicit consultation with your treating physician.`;
  }

  if (q.includes('how') || q.includes('online') || q.includes('process') || q.includes('consultation') || q.includes('video') || q.includes('courier') || q.includes('book')) {
    return `Online consultations with Dr. Harshika Singh work in 4 simple steps:
1. **Select Slot**: Pick your date and convenient morning/evening slot (IST).
2. **Submit Intake**: Share your symptoms and upload recent lab reports in the Patient Portal.
3. **1-on-1 Consultation**: Connect with Dr. Harshika via secure video call or phone call.
4. **Prescription & Delivery**: Receive your digital prescription, with authentic homoeopathic medicines dispatched across India.

Clinic WhatsApp Desk: +91 80102 81579.`;
  }

  return `Namaste! I am the clinical assistant for Dr. Harshika Singh, BHMS, MD (Hom.).

Dr. Harshika provides individualized, evidence-based homoeopathic care with clinical focus on **Hormonal Health & PCOS**, **Thyroid & Metabolic Wellness**, and **Joint Mobility**.

Online consultations are conducted across India (New Consultation: ₹799). You can click **"Book an Appointment"** or message our clinic desk on WhatsApp at **+91 80102 81579**.`;
}
