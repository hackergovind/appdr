import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Calendar, Users, FileText, Settings, CheckCircle2, 
  XCircle, Clock, Search, Plus, Trash2, Edit3, MessageCircle, DollarSign,
  TrendingUp, RefreshCw, Key
} from 'lucide-react';
import { 
  collection, getDocs, doc, updateDoc, setDoc, query, orderBy 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Appointment, Article, ClinicSettings } from '../types';

interface AdminDashboardProps {
  clinicSettings: ClinicSettings;
  onUpdateSettings: (newSettings: ClinicSettings) => void;
  articles: Article[];
  onUpdateArticles: (articles: Article[]) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  clinicSettings,
  onUpdateSettings,
  articles,
  onUpdateArticles,
}) => {
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'appointments' | 'schedule' | 'articles' | 'analytics'>('appointments');

  // Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingApts, setLoadingApts] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Settings form state
  const [consultationFee, setConsultationFee] = useState(clinicSettings.consultationFee);
  const [followupFee, setFollowupFee] = useState(clinicSettings.followupFee);
  const [upiId, setUpiId] = useState(clinicSettings.upiId);
  const [clinicPhone, setClinicPhone] = useState(clinicSettings.clinicPhone);
  const [daysActive, setDaysActive] = useState(clinicSettings.daysActive);
  const [announcement, setAnnouncement] = useState(clinicSettings.announcement || '');
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Article form state
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [artTitle, setArtTitle] = useState('');
  const [artCategory, setArtCategory] = useState<Article['category']>('thyroid');
  const [artSummary, setArtSummary] = useState('');
  const [artContent, setArtContent] = useState('');
  const [artReadTime, setArtReadTime] = useState('5 min read');

  // Check if current user is logged in as doctor
  useEffect(() => {
    if (auth.currentUser?.email === 'harshikasingh631999@gmail.com') {
      setIsAdminUnlocked(true);
    }
  }, []);

  const handleUnlockWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow doctor passcode or email
    if (passcode === '1999' || passcode.toLowerCase() === 'harshika' || auth.currentUser?.email === 'harshikasingh631999@gmail.com') {
      setIsAdminUnlocked(true);
      setAuthError(null);
    } else {
      setAuthError('Incorrect doctor access passkey. Please verify your credentials.');
    }
  };

  const fetchAppointments = async () => {
    setLoadingApts(true);
    try {
      const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as Appointment));
      setAppointments(list);
    } catch (err) {
      console.warn('Admin appointment fetch:', err);
    } finally {
      setLoadingApts(false);
    }
  };

  useEffect(() => {
    if (isAdminUnlocked) {
      fetchAppointments();
    }
  }, [isAdminUnlocked]);

  const handleUpdateStatus = async (aptId: string, newStatus: Appointment['status']) => {
    try {
      await updateDoc(doc(db, 'appointments', aptId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, status: newStatus } : a));
    } catch (err) {
      console.error('Failed to update appointment:', err);
    }
  };

  const handleUpdatePayment = async (aptId: string, paymentStatus: Appointment['paymentStatus']) => {
    try {
      await updateDoc(doc(db, 'appointments', aptId), {
        paymentStatus,
        updatedAt: new Date().toISOString()
      });
      setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, paymentStatus } : a));
    } catch (err) {
      console.error('Failed to update payment status:', err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    const updated: ClinicSettings = {
      ...clinicSettings,
      consultationFee: Number(consultationFee),
      followupFee: Number(followupFee),
      upiId: upiId.trim(),
      clinicPhone: clinicPhone.trim(),
      daysActive: daysActive.trim(),
      announcement: announcement.trim(),
    };

    try {
      await setDoc(doc(db, 'clinic_settings', 'general'), updated, { merge: true });
      onUpdateSettings(updated);
      setSaveSuccess('Clinic consultation parameters updated successfully.');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to update clinic settings:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artTitle.trim() || !artContent.trim()) return;

    const newArt: Article = {
      id: `art_${Date.now()}`,
      title: artTitle.trim(),
      slug: artTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: artCategory,
      summary: artSummary.trim(),
      content: artContent.trim(),
      readTime: artReadTime,
      isPublished: true,
      author: 'Dr. Harshika Singh, BHMS, MD (Hom.)',
      publishedAt: 'October 2026',
    };

    try {
      await setDoc(doc(db, 'articles', newArt.id), newArt);
      onUpdateArticles([newArt, ...articles]);
      setShowArticleForm(false);
      setArtTitle('');
      setArtSummary('');
      setArtContent('');
      setSaveSuccess('New educational article published.');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to publish article:', err);
    }
  };

  // Filtered appointments
  const filteredApts = appointments.filter(a => {
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchesQuery = 
      a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.patientPhone.includes(searchQuery) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  // Basic analytics calculations
  const totalBookings = appointments.length;
  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed' || a.status === 'completed').length;
  const estimatedRevenue = appointments
    .filter(a => a.paymentStatus === 'verified' || a.status === 'completed')
    .reduce((sum, a) => sum + (a.amount || 799), 0);

  if (!isAdminUnlocked) {
    return (
      <div className="py-12 px-4 max-w-md mx-auto">
        <div className="bg-white rounded-2xl border border-[#CCD8CF] p-8 text-center shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#E8EFE9] text-[#1D4D43] flex items-center justify-center mx-auto mb-4">
            <Key className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold font-serif text-[#1B2A26] mb-1">
            Doctor Administration
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Private management console for Dr. Harshika Singh.
          </p>

          {authError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              {authError}
            </div>
          )}

          <form onSubmit={handleUnlockWithPin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 text-left">
                Doctor Access Passkey
              </label>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter access code (or sign in with doctor email)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1D4D43]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block text-left">
                Doctor default key: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">1999</code> or doctor Google account
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#1D4D43] hover:bg-[#163D35] text-white text-xs font-bold tracking-wide shadow-sm transition-all"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1D4D43]">
            Doctor Administration
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#1B2A26]">
            Dr. Harshika Singh's Practice Console
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchAppointments}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAdminUnlocked(false)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Lock Dashboard
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#CCD8CF] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Bookings</span>
            <Calendar className="w-4 h-4 text-[#1D4D43]" />
          </div>
          <div className="text-2xl font-bold font-serif text-[#1B2A26] mt-2">
            {totalBookings}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#CCD8CF] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-serif text-amber-600 mt-2">
            {pendingCount}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#CCD8CF] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Confirmed / Done</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-emerald-700 mt-2">
            {confirmedCount}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#CCD8CF] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Settled Fees</span>
            <DollarSign className="w-4 h-4 text-[#1D4D43]" />
          </div>
          <div className="text-2xl font-bold font-serif text-[#1D4D43] mt-2">
            ₹{estimatedRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'appointments'
              ? 'border-[#1D4D43] text-[#1D4D43]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Consultation Requests ({appointments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('schedule')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'schedule'
              ? 'border-[#1D4D43] text-[#1D4D43]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Fees &amp; Clinic Timing
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('articles')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'articles'
              ? 'border-[#1D4D43] text-[#1D4D43]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Publish Articles ({articles.length})
        </button>
      </div>

      {/* TAB 1: Appointments Management */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          {/* Filter & Search */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#CCD8CF]">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                    filterStatus === st
                      ? 'bg-[#1D4D43] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, phone, or ID..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-[#1D4D43]"
              />
            </div>
          </div>

          {/* Appointments Table / List */}
          {loadingApts ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading consultation requests...</div>
          ) : filteredApts.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-xl border border-slate-200">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-600 font-medium">No matching consultation requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApts.map((apt) => {
                const whatsappUrl = `https://wa.me/${apt.patientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Hello ${apt.patientName}, this is Dr. Harshika Singh's clinic regarding your online consultation on ${apt.appointmentDate} at ${apt.timeSlot}.`
                )}`;

                return (
                  <div
                    key={apt.id}
                    className="p-5 rounded-2xl bg-white border border-[#CCD8CF] shadow-xs space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#1D4D43]">
                          {apt.id}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs font-semibold text-slate-900">
                          {apt.patientName} ({apt.age}y, {apt.gender})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status badge */}
                        <select
                          value={apt.status}
                          onChange={(e) => handleUpdateStatus(apt.id, e.target.value as Appointment['status'])}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="rescheduled">Rescheduled</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>

                        {/* Payment badge */}
                        <select
                          value={apt.paymentStatus}
                          onChange={(e) => handleUpdatePayment(apt.id, e.target.value as Appointment['paymentStatus'])}
                          className={`px-2 py-1 text-xs font-semibold rounded-lg border ${
                            apt.paymentStatus === 'verified'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="unpaid">Payment: Unpaid</option>
                          <option value="verified">Payment: Verified</option>
                          <option value="waived">Payment: Waived</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-[#FBFBF9] p-3 rounded-xl border border-slate-100">
                      <div>
                        <strong>Date &amp; Slot:</strong> {apt.appointmentDate} at {apt.timeSlot}
                      </div>
                      <div>
                        <strong>Contact:</strong> {apt.patientPhone}
                      </div>
                      <div>
                        <strong>Category:</strong> <span className="capitalize">{apt.category.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <strong>Mode:</strong> <span className="capitalize">{apt.mode}</span>
                      </div>
                      <div>
                        <strong>Fee:</strong> ₹{apt.amount}
                      </div>
                      {apt.paymentMethod && (
                        <div>
                          <strong>Method:</strong> <span className="capitalize">{apt.paymentMethod.replace('_', ' ')}</span>
                        </div>
                      )}
                      {apt.transactionId && (
                        <div className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <strong>Txn ID:</strong> {apt.transactionId}
                        </div>
                      )}
                      {apt.utrNumber && (
                        <div className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          <strong>UPI UTR:</strong> {apt.utrNumber}
                        </div>
                      )}
                    </div>

                    {apt.chiefComplaint && (
                      <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200 whitespace-pre-line">
                        <strong className="text-slate-900">Chief Health Complaint / Attached Assessment:</strong>
                        <br />
                        {apt.chiefComplaint}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-[11px] text-slate-400">
                        Received: {new Date(apt.createdAt).toLocaleString()}
                      </span>

                      <div className="flex items-center gap-2">
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat on WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Fees & Clinic Timings */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-2xl border border-[#CCD8CF] p-6 max-w-2xl shadow-xs">
          <h3 className="text-lg font-bold font-serif text-[#1B2A26] mb-1">
            Consultation Parameters &amp; Clinic Timing
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Configure the fees, active consultation hours, and clinic announcements displayed across the platform.
          </p>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  New Patient Fee (INR)
                </label>
                <input
                  type="number"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1D4D43]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Follow-Up Review Fee (INR)
                </label>
                <input
                  type="number"
                  value={followupFee}
                  onChange={(e) => setFollowupFee(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1D4D43]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Clinic UPI ID
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1D4D43]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Clinic WhatsApp / Phone
                </label>
                <input
                  type="text"
                  value={clinicPhone}
                  onChange={(e) => setClinicPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1D4D43]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Active Consultation Days &amp; Hours
              </label>
              <input
                type="text"
                value={daysActive}
                onChange={(e) => setDaysActive(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1D4D43]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Doctor Announcement Banner
              </label>
              <textarea
                rows={2}
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1D4D43]"
              />
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="py-3 px-6 rounded-xl bg-[#1D4D43] text-white text-xs font-bold hover:bg-[#163D35] transition-colors"
            >
              {savingSettings ? 'Saving Settings...' : 'Save Clinic Settings'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: Publish Articles */}
      {activeTab === 'articles' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-serif text-[#1B2A26]">Published Health Articles</h3>
              <p className="text-xs text-slate-500">Curate evidence-informed patient educational guides</p>
            </div>
            <button
              type="button"
              onClick={() => setShowArticleForm(!showArticleForm)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#1D4D43] text-white rounded-lg hover:bg-[#163D35] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showArticleForm ? 'Close Form' : 'New Article'}</span>
            </button>
          </div>

          {showArticleForm && (
            <form onSubmit={handleSaveArticle} className="p-6 rounded-2xl bg-white border border-[#CCD8CF] space-y-4 max-w-2xl shadow-xs">
              <h4 className="text-sm font-bold text-[#1D4D43] uppercase tracking-wider">
                Create Educational Article
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={artTitle}
                  onChange={(e) => setArtTitle(e.target.value)}
                  placeholder="e.g. Navigating Hashimoto's Thyroiditis Holistically"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1D4D43]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={artCategory}
                    onChange={(e) => setArtCategory(e.target.value as Article['category'])}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1D4D43]"
                  >
                    <option value="thyroid">Thyroid Health</option>
                    <option value="hormonal_pcos">PCOS &amp; Hormonal Balance</option>
                    <option value="joint_pain">Joint Pain &amp; Mobility</option>
                    <option value="hair_wellness">Hair &amp; Vitality</option>
                    <option value="preventive">Preventive Health</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Reading Time
                  </label>
                  <input
                    type="text"
                    value={artReadTime}
                    onChange={(e) => setArtReadTime(e.target.value)}
                    placeholder="e.g. 5 min read"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1D4D43]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Summary Teaser *
                </label>
                <textarea
                  rows={2}
                  required
                  value={artSummary}
                  onChange={(e) => setArtSummary(e.target.value)}
                  placeholder="Brief 1-2 sentence overview for the card..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1D4D43]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Article Prose &amp; Evidence *
                </label>
                <textarea
                  rows={6}
                  required
                  value={artContent}
                  onChange={(e) => setArtContent(e.target.value)}
                  placeholder="Write full article text here. Separate paragraphs with double line breaks..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1D4D43]"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowArticleForm(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-[#1D4D43] text-white hover:bg-[#163D35] rounded-xl transition-colors"
                >
                  Publish Article
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {articles.map((art) => (
              <div
                key={art.id}
                className="p-4 rounded-xl bg-white border border-[#CCD8CF] flex items-center justify-between shadow-xs"
              >
                <div>
                  <div className="text-xs font-bold text-[#1B2A26]">{art.title}</div>
                  <div className="text-[11px] text-slate-400 capitalize mt-0.5">
                    {art.category.replace('_', ' ')} · {art.readTime} · Published {art.publishedAt}
                  </div>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  Live
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
