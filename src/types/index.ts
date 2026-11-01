export type AppointmentStatus = 'pending' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed';
export type PaymentStatus = 'unpaid' | 'verified' | 'waived';
export type ConsultationCategory = 
  | 'hormonal_balance'
  | 'thyroid_care'
  | 'joint_wellness'
  | 'hair_fall'
  | 'general_wellness';

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  age: number;
  gender: 'female' | 'male' | 'other';
  chiefComplaint: string;
  category: ConsultationCategory;
  appointmentDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:30 AM"
  consultationType: 'new' | 'followup';
  mode: 'video' | 'voice';
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  amount: number;
  paymentMethod?: 'gateway_instant' | 'upi_direct' | 'pay_after_review';
  transactionId?: string;
  utrNumber?: string;
  triageScore?: number;
  triageSummary?: string;
  notes?: string;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PatientProfile {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  city?: string;
  state?: string;
  medicalHistorySummary?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface HealthRecord {
  id: string;
  patientId: string;
  title: string;
  recordType: 'lab_report' | 'prescription' | 'imaging' | 'doctor_note';
  date: string;
  fileData?: string; // base64 or stored URL
  fileName?: string;
  fileType?: string;
  notes?: string;
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: 'thyroid' | 'hormonal_pcos' | 'menstrual' | 'joint_pain' | 'hair_wellness' | 'preventive';
  summary: string;
  content: string;
  readTime: string;
  isPublished: boolean;
  author: string;
  publishedAt: string;
  evidencePoints?: string[];
}

export interface ClinicSettings {
  consultationFee: number;
  followupFee: number;
  upiId: string;
  clinicPhone: string;
  clinicEmail: string;
  daysActive: string;
  bookingEnabled: boolean;
  announcement?: string;
}
