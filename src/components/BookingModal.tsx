import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, User, Phone, Mail, FileText, CheckCircle2, 
  ShieldCheck, ArrowRight, MessageCircle, Copy, Check, CreditCard, 
  QrCode, AlertCircle, Printer, Download, Sparkles, ExternalLink
} from 'lucide-react';
import { collection, doc, setDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Appointment, ConsultationCategory } from '../types';
import { DOCTOR_PROFILE } from '../data/defaultData';
import confetti from 'canvas-confetti';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: ConsultationCategory;
  initialNotes?: string;
  currentUserId?: string;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  consultationFee?: number;
  followupFee?: number;
}

const AVAILABLE_TIME_SLOTS = [
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
];

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialCategory = 'hormonal_balance',
  initialNotes = '',
  currentUserId,
  userEmail = '',
  userName = '',
  userPhone = '',
  consultationFee = 799,
  followupFee = 499,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [consultationType, setConsultationType] = useState<'new' | 'followup'>('new');
  const [category, setCategory] = useState<ConsultationCategory>(initialCategory);
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [mode, setMode] = useState<'video' | 'voice'>('video');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Patient Info
  const [patientName, setPatientName] = useState(userName);
  const [patientPhone, setPatientPhone] = useState(userPhone);
  const [patientEmail, setPatientEmail] = useState(userEmail);
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<'female' | 'male' | 'other'>('female');
  const [chiefComplaint, setChiefComplaint] = useState(initialNotes);
  const [hasConsented, setHasConsented] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Payment workflow states
  const [paymentMethod, setPaymentMethod] = useState<'gateway_instant' | 'upi_direct' | 'pay_after_review'>('gateway_instant');
  const [utrNumber, setUtrNumber] = useState('');
  const [savingUtr, setSavingUtr] = useState(false);
  const [utrSaved, setUtrSaved] = useState(false);

  // Gateway Simulation state
  const [gatewaySimulating, setGatewaySimulating] = useState(false);
  const [gatewayStep, setGatewayStep] = useState<'idle' | 'processing' | 'success'>('idle');
  const [simulatedCard, setSimulatedCard] = useState('4532 •••• •••• 8892');
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Set default minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
    if (initialNotes) setChiefComplaint(initialNotes);
    if (userName && !patientName) setPatientName(userName);
    if (userEmail && !patientEmail) setPatientEmail(userEmail);
    if (userPhone && !patientPhone) setPatientPhone(userPhone);
  }, [initialCategory, initialNotes, userName, userEmail, userPhone]);

  // Load booked slots from Firestore for the selected date to prevent double bookings
  useEffect(() => {
    if (!appointmentDate) return;
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const q = query(
          collection(db, 'appointments'),
          where('appointmentDate', '==', appointmentDate),
          where('status', 'in', ['pending', 'confirmed'])
        );
        const snapshot = await getDocs(q);
        const booked = snapshot.docs.map(d => d.data().timeSlot as string);
        setBookedSlots(booked);
      } catch (err) {
        console.warn('Could not fetch existing slots, defaulting to open availability:', err);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [appointmentDate]);

  if (!isOpen) return null;

  const currentFee = consultationType === 'new' ? consultationFee : followupFee;

  const handleNextToDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentDate || !timeSlot) {
      setErrorMsg('Please select your preferred consultation date and available time slot.');
      return;
    }
    setErrorMsg(null);
    setStep(2);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim() || !chiefComplaint.trim()) {
      setErrorMsg('Please provide your name, phone number, and brief description of health complaint.');
      return;
    }
    if (!hasConsented) {
      setErrorMsg('Please acknowledge the patient consent and medical disclaimer.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const appointmentId = `APT-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAppointment: Appointment = {
      id: appointmentId,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      patientEmail: patientEmail.trim() || userEmail || 'consultation@drharshika.in',
      age: Number(age) || 28,
      gender,
      chiefComplaint: chiefComplaint.trim(),
      category,
      appointmentDate,
      timeSlot,
      consultationType,
      mode,
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentMethod,
      amount: currentFee,
      userId: currentUserId || `guest_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'appointments', appointmentId), newAppointment);
      setConfirmedAppointment(newAppointment);
      setStep(3);
      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch {
        // Safe
      }
    } catch (err) {
      console.error('Failed to save appointment:', err);
      try {
        handleFirestoreError(err, OperationType.WRITE, 'appointments');
      } catch (e: unknown) {
        setErrorMsg('Booking request could not be saved to server. Please verify your internet connection or reach out on WhatsApp.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Gateway Simulation Handler
  const handleSimulatePayment = async () => {
    if (!confirmedAppointment) return;
    setGatewaySimulating(true);
    setGatewayStep('processing');

    setTimeout(async () => {
      const generatedTxnId = `TXN-${Date.now().toString(36).toUpperCase()}`;
      try {
        await updateDoc(doc(db, 'appointments', confirmedAppointment.id), {
          paymentStatus: 'verified',
          paymentMethod: 'gateway_instant',
          transactionId: generatedTxnId,
          status: 'confirmed',
          updatedAt: new Date().toISOString(),
        });
        setConfirmedAppointment(prev => prev ? {
          ...prev,
          paymentStatus: 'verified',
          paymentMethod: 'gateway_instant',
          transactionId: generatedTxnId,
          status: 'confirmed',
        } : null);
        setGatewayStep('success');
        try {
          confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
        } catch {
          // Safe
        }
      } catch (err) {
        console.error('Failed to update verified payment:', err);
      } finally {
        setGatewaySimulating(false);
      }
    }, 1600);
  };

  // UTR Submission Handler
  const handleSaveUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedAppointment || !utrNumber.trim()) return;
    setSavingUtr(true);
    try {
      await updateDoc(doc(db, 'appointments', confirmedAppointment.id), {
        utrNumber: utrNumber.trim(),
        paymentMethod: 'upi_direct',
        paymentStatus: 'pending',
        updatedAt: new Date().toISOString(),
      });
      setConfirmedAppointment(prev => prev ? {
        ...prev,
        utrNumber: utrNumber.trim(),
        paymentMethod: 'upi_direct',
      } : null);
      setUtrSaved(true);
    } catch (err) {
      console.error('Failed to save UTR:', err);
    } finally {
      setSavingUtr(false);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText('drharshika@upi');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const getWhatsAppBookingLink = () => {
    if (!confirmedAppointment) return '#';
    const paymentInfo = confirmedAppointment.paymentStatus === 'verified'
      ? `*Payment:* Verified via Online Gateway (Txn ID: ${confirmedAppointment.transactionId || 'Instant'})`
      : confirmedAppointment.utrNumber
      ? `*Payment:* Transferred via UPI (UTR/Ref: ${confirmedAppointment.utrNumber})`
      : `*Payment:* Settlement pending upon doctor review`;

    const text = encodeURIComponent(
      `Hello Dr. Harshika Singh,\n\nI have booked an online consultation on your app.\n\n*Appointment ID:* ${confirmedAppointment.id}\n*Patient Name:* ${confirmedAppointment.patientName} (${confirmedAppointment.age}y, ${confirmedAppointment.gender})\n*Date & Slot:* ${confirmedAppointment.appointmentDate} at ${confirmedAppointment.timeSlot}\n*Category:* ${confirmedAppointment.category.replace('_', ' ')}\n*Consultation Type:* ${confirmedAppointment.consultationType === 'new' ? 'New Consultation' : 'Follow-up'}\n${paymentInfo}\n\nPlease confirm availability and share the meeting link.`
    );
    return `https://wa.me/${DOCTOR_PROFILE.whatsappNumber}?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-[#CCD8CF] overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="bg-[#1D4D43] text-white px-6 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#D4AF37]">
                Online Consultation Booking
              </span>
              <span className="text-emerald-300 text-xs">· Step {step} of 3</span>
            </div>
            <h3 className="text-xl font-bold font-serif">
              {step === 1 && "Select Consultation Slot"}
              {step === 2 && "Patient Information & Payment Preference"}
              {step === 3 && "Booking Confirmation & Payment Settlement"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: Date, Slot & Category Selection */}
          {step === 1 && (
            <form onSubmit={handleNextToDetails} className="space-y-6">
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Consultation Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConsultationType('new')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      consultationType === 'new'
                        ? 'border-[#1D4D43] bg-[#F0F5F1] text-[#1D4D43] shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className="text-sm font-semibold">New Patient Consultation</div>
                    <div className="text-xs text-slate-500 mt-0.5">30–45 mins in-depth case intake</div>
                    <div className="text-xs font-bold text-[#1D4D43] mt-2">₹{consultationFee}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConsultationType('followup')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      consultationType === 'followup'
                        ? 'border-[#1D4D43] bg-[#F0F5F1] text-[#1D4D43] shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className="text-sm font-semibold">Follow-Up Review</div>
                    <div className="text-xs text-slate-500 mt-0.5">Progress tracking & dose evaluation</div>
                    <div className="text-xs font-bold text-[#1D4D43] mt-2">₹{followupFee}</div>
                  </button>
                </div>
              </div>

              {/* Clinical Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Primary Clinical Area
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ConsultationCategory)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#1D4D43]"
                >
                  <option value="hormonal_balance">Hormonal Balance &amp; PCOS Care</option>
                  <option value="thyroid_care">Thyroid &amp; Metabolic Care</option>
                  <option value="joint_wellness">Joint Pain &amp; Mobility Wellness</option>
                  <option value="hair_fall">Hair Fall &amp; Nutritional Vitality</option>
                  <option value="general_wellness">General Chronic Health Evaluation</option>
                </select>
              </div>

              {/* Consultation Mode */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Consultation Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('video')}
                    className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                      mode === 'video'
                        ? 'border-[#1D4D43] bg-[#F0F5F1] text-[#1D4D43]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Video Consultation (Google Meet / WhatsApp Video)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('voice')}
                    className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                      mode === 'voice'
                        ? 'border-[#1D4D43] bg-[#F0F5F1] text-[#1D4D43]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Direct Voice Call
                  </button>
                </div>
              </div>

              {/* Date & Slot */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#1D4D43]" />
                    <span>Preferred Date</span>
                  </label>
                  <input
                    type="date"
                    min={minDateStr}
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#1D4D43]"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Available Monday to Saturday
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#1D4D43]" />
                    <span>Available Slot (IST)</span>
                  </label>
                  {loadingSlots ? (
                    <div className="py-2.5 text-xs text-slate-500 animate-pulse">Checking doctor availability...</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {AVAILABLE_TIME_SLOTS.map((slot) => {
                        const isBooked = bookedSlots.includes(slot);
                        const isSelected = timeSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isBooked}
                            onClick={() => setTimeSlot(slot)}
                            className={`py-2 px-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                              isBooked
                                ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed line-through'
                                : isSelected
                                ? 'bg-[#1D4D43] border-[#1D4D43] text-white shadow-xs'
                                : 'border-slate-200 text-slate-700 hover:border-[#1D4D43] hover:bg-[#F0F5F1]'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={!appointmentDate || !timeSlot}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold tracking-wide text-white transition-all shadow-sm ${
                    !appointmentDate || !timeSlot
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-[#1D4D43] hover:bg-[#163D35]'
                  }`}
                >
                  <span>Proceed to Patient Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Patient Intake Details, Payment Method & Consent */}
          {step === 2 && (
            <form onSubmit={handleConfirmBooking} className="space-y-4">
              <div className="p-3 rounded-xl bg-[#F0F5F1] border border-[#CCD8CF] flex items-center justify-between text-xs text-slate-700">
                <div>
                  <strong>Appointment:</strong> {appointmentDate} at {timeSlot} ({consultationType === 'new' ? 'New Patient' : 'Follow-up'}) · ₹{currentFee}
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-[#1D4D43] font-semibold underline"
                >
                  Change Slot
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#1D4D43]" />
                    <span>Patient Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter patient name"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1D4D43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#1D4D43]" />
                    <span>WhatsApp / Contact Number *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1D4D43]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#1D4D43]" />
                    <span>Email Address (for digital prescription)</span>
                  </label>
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1D4D43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Age &amp; Gender *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      required
                      min="1"
                      max="110"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Age"
                      className="w-16 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1D4D43]"
                    />
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'female' | 'male' | 'other')}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1D4D43]"
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Chief Health Complaints */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#1D4D43]" />
                  <span>Chief Complaint &amp; Health History *</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="Describe your current symptoms, how long you have had them, and any medications or recent test results..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1D4D43]"
                />
              </div>

              {/* Payment Workflow Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Select Consultation Payment Workflow
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('gateway_instant')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentMethod === 'gateway_instant'
                        ? 'border-[#1D4D43] bg-[#F0F5F1] text-[#1D4D43] shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Instant Gateway</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">UPI Apps, Cards &amp; NetBanking</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi_direct')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentMethod === 'upi_direct'
                        ? 'border-[#1D4D43] bg-[#F0F5F1] text-[#1D4D43] shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Direct UPI QR</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">Pay to clinic VPA &amp; enter UTR</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pay_after_review')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentMethod === 'pay_after_review'
                        ? 'border-[#1D4D43] bg-[#F0F5F1] text-[#1D4D43] shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pay on Approval</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">Doctor reviews slot first</div>
                  </button>
                </div>
              </div>

              {/* Consent & Privacy Notice */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasConsented}
                    onChange={(e) => setHasConsented(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-[#1D4D43] focus:ring-[#1D4D43] border-slate-300"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I confirm that I am requesting an online homoeopathic consultation with Dr. Harshika Singh, BHMS, MD (Hom.). I understand that this consultation follows Indian Telemedicine guidelines, does not guarantee cure, and does not substitute for emergency medical care.
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting || !hasConsented}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold tracking-wide text-white transition-all shadow-sm ${
                    submitting || !hasConsented
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-[#1D4D43] hover:bg-[#163D35]'
                  }`}
                >
                  {submitting ? (
                    <span>Confirming Reservation...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirm &amp; Proceed to Payment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Booking Confirmed & Interactive Payment Gateway / UPI / Review */}
          {step === 3 && confirmedAppointment && (
            <div className="space-y-6 animate-in fade-in">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-[#E8EFE9] text-[#1D4D43] flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-bold font-serif text-[#1B2A26]">Consultation Slot Reserved!</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Your appointment request is saved in Dr. Harshika Singh's practice schedule.
                </p>
                <div className="inline-block mt-2 px-3 py-1 rounded-md bg-[#F0F5F1] border border-[#CCD8CF] text-xs font-mono font-semibold text-[#1D4D43]">
                  Reference ID: {confirmedAppointment.id}
                </div>
              </div>

              {/* Summary Details */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-semibold">{confirmedAppointment.patientName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Date &amp; Slot:</span>
                  <span className="font-semibold">{confirmedAppointment.appointmentDate} at {confirmedAppointment.timeSlot}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Clinical Focus:</span>
                  <span className="font-semibold capitalize">{confirmedAppointment.category.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Consultation Fee:</span>
                  <span className="font-bold text-[#1D4D43] text-sm">₹{confirmedAppointment.amount}</span>
                </div>
                <div className="flex justify-between py-1 pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className={`font-bold capitalize ${
                    confirmedAppointment.paymentStatus === 'verified' ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {confirmedAppointment.paymentStatus === 'verified' ? 'Verified & Settled' : 'Pending Settlement'}
                  </span>
                </div>
              </div>

              {/* Interactive Payment Workflow Tabs */}
              <div className="border border-[#CCD8CF] rounded-2xl overflow-hidden bg-white shadow-xs">
                {/* Workflow Selector */}
                <div className="flex border-b border-[#CCD8CF] bg-[#F8FAF8] text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('gateway_instant')}
                    className={`flex-1 py-3 px-3 text-center transition-colors ${
                      paymentMethod === 'gateway_instant'
                        ? 'bg-white text-[#1D4D43] border-b-2 border-[#1D4D43]'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    1. Instant Gateway
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi_direct')}
                    className={`flex-1 py-3 px-3 text-center transition-colors ${
                      paymentMethod === 'upi_direct'
                        ? 'bg-white text-[#1D4D43] border-b-2 border-[#1D4D43]'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    2. Direct UPI QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pay_after_review')}
                    className={`flex-1 py-3 px-3 text-center transition-colors ${
                      paymentMethod === 'pay_after_review'
                        ? 'bg-white text-[#1D4D43] border-b-2 border-[#1D4D43]'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    3. Pay on Review
                  </button>
                </div>

                <div className="p-5">
                  {/* WORKFLOW 1: Instant Gateway Simulator */}
                  {paymentMethod === 'gateway_instant' && (
                    <div className="space-y-4">
                      {confirmedAppointment.paymentStatus === 'verified' ? (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                          <h5 className="text-sm font-bold text-emerald-900">Payment Successfully Verified!</h5>
                          <p className="text-xs text-emerald-700 font-mono">
                            Transaction Reference: {confirmedAppointment.transactionId}
                          </p>
                          <div className="pt-2 flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setShowReceiptModal(true)}
                              className="px-4 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 inline-flex items-center gap-1.5"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>View / Print Consultation Receipt</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700">Online Gateway Simulator</span>
                            <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px] font-bold">
                              TEST CHECKOUT
                            </span>
                          </div>
                          
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Simulated Payment Card:</span>
                              <span className="font-mono font-semibold text-slate-800">{simulatedCard}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Amount Due:</span>
                              <span className="font-bold text-[#1D4D43]">₹{confirmedAppointment.amount} INR</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Doctor Merchant:</span>
                              <span className="font-semibold">Dr. Harshika Singh Clinic</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={gatewaySimulating}
                            onClick={handleSimulatePayment}
                            className="w-full py-3 rounded-xl bg-[#1D4D43] hover:bg-[#163D35] text-white text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all"
                          >
                            {gatewaySimulating ? (
                              <>
                                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                <span>Processing Secure Transaction...</span>
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                                <span>Authorize &amp; Settle ₹{confirmedAppointment.amount} Instantly</span>
                              </>
                            )}
                          </button>
                          <p className="text-[11px] text-slate-400 text-center">
                            Simulates real bank 3D-Secure approval and generates live appointment confirmation.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* WORKFLOW 2: Direct UPI QR & VPA */}
                  {paymentMethod === 'upi_direct' && (
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        {/* Dynamic SVG UPI QR Code representation */}
                        <div className="w-28 h-28 p-2 rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                          <QrCode className="w-20 h-20 text-[#1D4D43]" />
                          <span className="text-[9px] font-bold text-slate-500 mt-1">₹{confirmedAppointment.amount}</span>
                        </div>

                        <div className="space-y-2 text-xs text-slate-600 flex-1">
                          <p>
                            Scan with <strong>Google Pay, PhonePe, Paytm, or BHIM</strong> to transfer the consultation fee:
                          </p>
                          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                            <span className="font-mono text-xs font-bold text-[#1D4D43]">drharshika@upi</span>
                            <button
                              type="button"
                              onClick={copyUpiId}
                              className="px-2 py-1 text-[11px] font-semibold text-[#1D4D43] bg-white border border-slate-200 hover:bg-slate-100 rounded transition-colors inline-flex items-center gap-1"
                            >
                              {copiedUpi ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* UTR Input Form */}
                      <form onSubmit={handleSaveUtr} className="pt-2 border-t border-slate-100 space-y-2">
                        <label className="block text-xs font-semibold text-slate-700">
                          Enter 12-Digit UPI Transaction Reference (UTR)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            value={utrNumber}
                            onChange={(e) => setUtrNumber(e.target.value)}
                            placeholder="e.g. 429381749201"
                            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-[#1D4D43]"
                          />
                          <button
                            type="submit"
                            disabled={savingUtr || !utrNumber.trim()}
                            className="px-4 py-2 bg-[#1D4D43] text-white rounded-xl text-xs font-semibold hover:bg-[#163D35] whitespace-nowrap transition-colors"
                          >
                            {savingUtr ? 'Saving...' : utrSaved ? 'UTR Updated' : 'Submit Reference'}
                          </button>
                        </div>
                        {utrSaved && (
                          <p className="text-[11px] text-emerald-700 font-medium">
                            ✓ Reference submitted. Doctor will verify against clinic bank records.
                          </p>
                        )}
                      </form>
                    </div>
                  )}

                  {/* WORKFLOW 3: Pay After Doctor Review */}
                  {paymentMethod === 'pay_after_review' && (
                    <div className="space-y-3 text-xs text-slate-600">
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                        <strong>Doctor Review Workflow:</strong> Your consultation request has been reserved with status <em>Pending Review</em>. Dr. Harshika Singh will inspect your intake notes and approve the slot availability.
                      </div>
                      <p>
                        You will receive an official approval message and payment link directly on WhatsApp at <strong>{confirmedAppointment.patientPhone}</strong>.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions: WhatsApp Direct Confirmation & Receipt */}
              <div className="space-y-2">
                <a
                  href={getWhatsAppBookingLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Confirmation to Clinic on WhatsApp</span>
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReceiptModal(true)}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#1D4D43]" />
                    <span>View Official Receipt</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
                  >
                    Done &amp; Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Official Consultation Receipt Modal */}
      {showReceiptModal && confirmedAppointment && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1D4D43] text-white flex items-center justify-center font-serif text-sm font-bold">
                  H
                </div>
                <div>
                  <h4 className="text-sm font-bold font-serif text-[#1B2A26]">Consultation Invoice Receipt</h4>
                  <p className="text-[10px] text-slate-400">Dr. Harshika | Wellness &amp; Homoeopathy</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Invoice Number:</span>
                <span className="font-mono font-semibold">{confirmedAppointment.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Consulting Doctor:</span>
                <span className="font-semibold">{DOCTOR_PROFILE.name}, {DOCTOR_PROFILE.qualifications}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Patient Name:</span>
                <span className="font-semibold">{confirmedAppointment.patientName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Consultation Date &amp; Slot:</span>
                <span className="font-semibold">{confirmedAppointment.appointmentDate} · {confirmedAppointment.timeSlot}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Category:</span>
                <span className="capitalize">{confirmedAppointment.category.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Consultation Mode:</span>
                <span className="capitalize">{confirmedAppointment.mode} Consultation</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Payment Status:</span>
                <span className="font-bold text-emerald-800 capitalize">{confirmedAppointment.paymentStatus}</span>
              </div>
              {confirmedAppointment.transactionId && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Txn Reference:</span>
                  <span className="font-mono text-[11px]">{confirmedAppointment.transactionId}</span>
                </div>
              )}
              {confirmedAppointment.utrNumber && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">UPI UTR Ref:</span>
                  <span className="font-mono text-[11px]">{confirmedAppointment.utrNumber}</span>
                </div>
              )}
              <div className="flex justify-between py-2 bg-[#F0F5F1] px-3 rounded-lg font-bold text-sm text-[#1D4D43]">
                <span>Total Amount Paid:</span>
                <span>₹{confirmedAppointment.amount} INR</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 text-center leading-tight">
              Official electronic receipt issued under Telemedicine Practice Guidelines of India. Contact clinic desk at +91 80102 81579 for any billing queries.
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#1D4D43] text-white text-xs font-semibold hover:bg-[#163D35] inline-flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
