import React, { useState, useEffect } from 'react';
import { 
  User, Calendar, Clock, FileUp, Shield, LogOut, CheckCircle2, 
  AlertCircle, Plus, Eye, Trash2, ArrowRight, X
} from 'lucide-react';
import { 
  signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, query, where, getDocs, doc, setDoc, deleteDoc, updateDoc 
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Appointment, HealthRecord, PatientProfile } from '../types';

interface PatientPortalProps {
  onOpenBooking: () => void;
  onOpenTriage: () => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  onOpenBooking,
}) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Data states
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [recordTitle, setRecordTitle] = useState('');
  const [recordType, setRecordType] = useState<HealthRecord['recordType']>('lab_report');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordNotes, setRecordNotes] = useState('');
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Profile Edit
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [historySummary, setHistorySummary] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Listen to auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
      if (currentUser) {
        fetchUserData(currentUser.uid, currentUser.email || '');
      } else {
        setAppointments([]);
        setHealthRecords([]);
        setProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid: string, email: string) => {
    setLoadingData(true);
    try {
      // 1. Fetch user appointments
      const aptQuery = query(
        collection(db, 'appointments'),
        where('userId', '==', uid)
      );
      const aptSnap = await getDocs(aptQuery);
      const userApts = aptSnap.docs.map(d => ({ ...d.data(), id: d.id } as Appointment));
      setAppointments(userApts.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));

      // 2. Fetch health records
      const recQuery = query(
        collection(db, 'health_records'),
        where('patientId', '==', uid)
      );
      const recSnap = await getDocs(recQuery);
      const userRecs = recSnap.docs.map(d => ({ ...d.data(), id: d.id } as HealthRecord));
      setHealthRecords(userRecs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));

      // 3. Fetch patient profile
      const profQuery = query(
        collection(db, 'patients'),
        where('userId', '==', uid)
      );
      const profSnap = await getDocs(profQuery);
      if (!profSnap.empty) {
        const profData = profSnap.docs[0].data() as PatientProfile;
        setProfile(profData);
        setPhone(profData.phone || '');
        setCity(profData.city || '');
        setHistorySummary(profData.medicalHistorySummary || '');
      } else {
        // Initialize default profile
        const initialProf: PatientProfile = {
          userId: uid,
          fullName: user?.displayName || 'Patient',
          email: email,
          phone: '',
          createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'patients', uid), initialProf);
        setProfile(initialProf);
      }
    } catch (err) {
      console.warn('Error fetching patient records:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      console.error('Sign in error:', err);
      setAuthError('Google sign-in could not be completed. Please ensure popups are allowed or try again.');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB limit. Please upload a compressed PDF or image.');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !recordTitle.trim()) return;

    setUploading(true);
    const recordId = `REC-${Date.now().toString(36).toUpperCase()}`;
    const newRecord: HealthRecord = {
      id: recordId,
      patientId: user.uid,
      title: recordTitle.trim(),
      recordType,
      date: recordDate,
      fileName: fileName || 'Document',
      fileData: fileBase64 || '',
      notes: recordNotes.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'health_records', recordId), newRecord);
      setHealthRecords(prev => [newRecord, ...prev]);
      setShowUploadModal(false);
      setRecordTitle('');
      setFileBase64(null);
      setFileName('');
      setRecordNotes('');
      setActionSuccess('Medical record uploaded securely.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error('Record upload failed:', err);
      handleFirestoreError(err, OperationType.CREATE, 'health_records');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRecord = async (recId: string) => {
    if (!confirm('Are you sure you want to remove this medical document?')) return;
    try {
      await deleteDoc(doc(db, 'health_records', recId));
      setHealthRecords(prev => prev.filter(r => r.id !== recId));
    } catch (err) {
      console.error('Failed to delete record:', err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    try {
      const updated: Partial<PatientProfile> = {
        phone: phone.trim(),
        city: city.trim(),
        medicalHistorySummary: historySummary.trim(),
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(doc(db, 'patients', user.uid), updated);
      setProfile(prev => prev ? { ...prev, ...updated } : null);
      setActionSuccess('Patient profile updated successfully.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#1D4D43]">
          Patient Portal
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#1B2A26] mt-1">
          Your Consultation &amp; Health Records
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Secure, encrypted patient access to past appointments, lab investigation uploads, and digital prescriptions under Dr. Harshika Singh's care.
        </p>
      </div>

      {actionSuccess && (
        <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {loadingAuth ? (
        <div className="p-12 text-center text-xs text-slate-500 animate-pulse">
          Authenticating secure patient session...
        </div>
      ) : !user ? (
        /* Unauthenticated View: Sign In Prompt */
        <div className="bg-white rounded-2xl border border-[#CCD8CF] p-8 md:p-12 text-center shadow-xs max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#E8EFE9] text-[#1D4D43] flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold font-serif text-[#1B2A26] mb-2">
            Sign In to Patient Portal
          </h3>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            Access your personalized medical records, upcoming appointment timings, and upload recent thyroid/PCOS reports directly for Dr. Harshika Singh.
          </p>

          {authError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs text-left">
              {authError}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 rounded-xl bg-[#1D4D43] hover:bg-[#163D35] text-white text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <span>Continue with Google</span>
          </button>

          <p className="text-[11px] text-slate-400 mt-4">
            Encrypted with Firebase Security Rules · Zero public data exposure
          </p>
        </div>
      ) : (
        /* Authenticated Portal Dashboard */
        <div className="space-y-8">
          {/* User Status Bar */}
          <div className="p-4 rounded-2xl bg-white border border-[#CCD8CF] flex flex-wrap items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E8EFE9] text-[#1D4D43] font-bold flex items-center justify-center text-sm">
                {user.displayName ? user.displayName[0].toUpperCase() : 'P'}
              </div>
              <div>
                <div className="text-sm font-semibold text-[#1B2A26]">
                  {user.displayName || 'Patient Account'}
                </div>
                <div className="text-xs text-slate-500">{user.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenBooking}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#1D4D43] text-white hover:bg-[#163D35] transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book Follow-Up</span>
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Grid: Appointments & Records */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Appointments & Reports */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Appointments Card */}
              <div className="bg-white rounded-2xl border border-[#CCD8CF] p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-[#1B2A26]">My Consultations</h3>
                    <p className="text-xs text-slate-500">Upcoming and previous booking requests</p>
                  </div>
                  <button
                    onClick={onOpenBooking}
                    className="text-xs font-semibold text-[#1D4D43] hover:underline"
                  >
                    + New Appointment
                  </button>
                </div>

                {loadingData ? (
                  <div className="py-6 text-center text-xs text-slate-400">Loading appointments...</div>
                ) : appointments.length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl">
                    <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-600 font-medium">No consultations recorded yet</p>
                    <p className="text-[11px] text-slate-400 mt-1">Book a slot with Dr. Harshika Singh to get started.</p>
                    <button
                      type="button"
                      onClick={onOpenBooking}
                      className="mt-3 px-4 py-1.5 text-xs font-semibold bg-[#1D4D43] text-white rounded-lg hover:bg-[#163D35]"
                    >
                      Book Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-[#FBFBF9] transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-semibold text-[#1D4D43]">
                            {apt.id}
                          </span>
                          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                            apt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            apt.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#1D4D43]" />
                            {apt.appointmentDate}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#1D4D43]" />
                            {apt.timeSlot}
                          </span>
                          <span>·</span>
                          <span className="capitalize text-slate-500">
                            {apt.category.replace('_', ' ')}
                          </span>
                        </div>
                        {apt.chiefComplaint && (
                          <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                            <strong className="text-slate-900">Chief Complaint:</strong> {apt.chiefComplaint}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Uploaded Health Records Card */}
              <div className="bg-white rounded-2xl border border-[#CCD8CF] p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-[#1B2A26]">Medical Reports &amp; Prescriptions</h3>
                    <p className="text-xs text-slate-500">Upload lab reports (TSH, ultrasound, fasting blood) for doctor review</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[#E8EFE9] text-[#1D4D43] hover:bg-[#DDE6E0] rounded-lg transition-colors"
                  >
                    <FileUp className="w-3.5 h-3.5" />
                    <span>Upload Report</span>
                  </button>
                </div>

                {healthRecords.length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl">
                    <FileUp className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-600 font-medium">No medical documents uploaded</p>
                    <p className="text-[11px] text-slate-400 mt-1">Upload your investigations before your consultation appointment.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {healthRecords.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between bg-white"
                      >
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-slate-900">{rec.title}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span className="capitalize">{rec.recordType.replace('_', ' ')}</span>
                            <span>·</span>
                            <span>{rec.date}</span>
                            {rec.fileName && (
                              <>
                                <span>·</span>
                                <span className="font-mono text-slate-400 truncate max-w-[150px]">{rec.fileName}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {rec.fileData && (
                            <a
                              href={rec.fileData}
                              download={rec.fileName || 'document'}
                              className="p-1.5 text-[#1D4D43] hover:bg-[#F0F5F1] rounded-lg transition-colors"
                              title="Download document"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(rec.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Patient Medical Profile Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#CCD8CF] p-6 shadow-xs">
                <h3 className="text-lg font-bold font-serif text-[#1B2A26] mb-1">
                  Health Profile
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Keeps your constitutional history synchronized for Dr. Harshika
                </p>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1D4D43]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      City / State
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Noida, UP"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1D4D43]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Known Allergies &amp; Chronic History
                    </label>
                    <textarea
                      rows={3}
                      value={historySummary}
                      onChange={(e) => setHistorySummary(e.target.value)}
                      placeholder="e.g. Hypothyroid since 2021 on 50mcg thyroxine; dust allergy..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1D4D43]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="w-full py-2.5 rounded-xl bg-[#1D4D43] text-white text-xs font-semibold hover:bg-[#163D35] transition-colors"
                  >
                    {savingProfile ? 'Saving Changes...' : 'Update Health Profile'}
                  </button>
                </form>
              </div>

              {/* Consultation Assistance box */}
              <div className="p-5 rounded-2xl bg-[#F0F5F1] border border-[#CCD8CF] space-y-2">
                <div className="text-xs font-bold text-[#1D4D43]">
                  Need Assistance with Records?
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  If you have bulky physical files or difficulty uploading, you can share high-resolution photos directly with the clinic reception via WhatsApp.
                </p>
                <a
                  href={`https://wa.me/918010281579?text=Hello%20Dr.%20Harshika%2C%20I%20need%20help%20sharing%20my%20medical%20reports.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D4D43] hover:underline pt-1"
                >
                  <span>Connect with Clinic Desk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Record Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#CCD8CF]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold font-serif text-[#1B2A26]">
                Upload Medical Document
              </h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={recordTitle}
                  onChange={(e) => setRecordTitle(e.target.value)}
                  placeholder="e.g. Thyroid Profile Oct 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1D4D43]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Document Type
                  </label>
                  <select
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value as HealthRecord['recordType'])}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1D4D43]"
                  >
                    <option value="lab_report">Lab Blood Report</option>
                    <option value="prescription">Prior Prescription</option>
                    <option value="imaging">Ultrasound / Imaging</option>
                    <option value="doctor_note">Doctor Notes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Report Date
                  </label>
                  <input
                    type="date"
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1D4D43]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Attach File (PDF or Image, max 2MB)
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#E8EFE9] file:text-[#1D4D43] hover:file:bg-[#DDE6E0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Notes for Doctor
                </label>
                <textarea
                  rows={2}
                  value={recordNotes}
                  onChange={(e) => setRecordNotes(e.target.value)}
                  placeholder="e.g. Fasting sample taken in morning..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1D4D43]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !recordTitle.trim()}
                  className="px-5 py-2 text-xs font-semibold bg-[#1D4D43] text-white hover:bg-[#163D35] rounded-xl transition-colors"
                >
                  {uploading ? 'Encrypting & Saving...' : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
