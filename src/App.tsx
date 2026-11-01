import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeScreen } from './components/HomeScreen';
import { HealthLibrary } from './components/HealthLibrary';
import { PatientPortal } from './components/PatientPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { BookingModal } from './components/BookingModal';
import { SymptomTriageModal } from './components/SymptomTriageModal';
import { MedicalDisclaimerModal } from './components/MedicalDisclaimerModal';
import { SplashScreen } from './components/SplashScreen';
import { ClinicChatbot } from './components/ClinicChatbot';
import { DEFAULT_ARTICLES, DEFAULT_CLINIC_SETTINGS, DOCTOR_PROFILE } from './data/defaultData';
import { Article, ClinicSettings, ConsultationCategory } from './types';
import { doc, getDoc } from 'firebase/firestore';
import { db, testConnection, auth } from './lib/firebase';
import { Calendar, MessageCircle } from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'library' | 'portal' | 'admin'>('home');

  // Modals state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingCategory, setBookingCategory] = useState<ConsultationCategory>('hormonal_balance');
  const [bookingNotes, setBookingNotes] = useState<string>('');
  const [isTriageOpen, setIsTriageOpen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  // App data state
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>(DEFAULT_CLINIC_SETTINGS);
  const [articles, setArticles] = useState<Article[]>(DEFAULT_ARTICLES);

  // Test Firestore connection on boot and load remote settings if available
  useEffect(() => {
    testConnection();

    const loadSettings = async () => {
      try {
        const settingsSnap = await getDoc(doc(db, 'clinic_settings', 'general'));
        if (settingsSnap.exists()) {
          setClinicSettings(settingsSnap.data() as ClinicSettings);
        }
      } catch (err) {
        console.warn('Using default clinic settings:', err);
      }
    };
    loadSettings();
  }, []);

  const handleOpenBooking = (category?: ConsultationCategory, notes?: string) => {
    if (category) setBookingCategory(category);
    if (notes) setBookingNotes(notes);
    setIsBookingOpen(true);
  };

  const handleTriageComplete = (category: ConsultationCategory, notes: string) => {
    handleOpenBooking(category, notes);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] text-[#1B2A26]">
      {/* 1. Splash Screen on Initial Boot */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}

      {/* 2. Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* Doctor Announcement Banner (if configured) */}
      {clinicSettings.announcement && (
        <div className="bg-[#E8EFE9] border-b border-[#CCD8CF] py-2 px-4 text-center text-xs text-[#1D4D43] font-medium">
          <span className="font-bold mr-1.5">Practice Update:</span>
          <span>{clinicSettings.announcement}</span>
        </div>
      )}

      {/* 3. Main Views */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeScreen
            onOpenBooking={handleOpenBooking}
            onOpenTriage={() => setIsTriageOpen(true)}
            onOpenLibrary={() => { setActiveTab('library'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            articles={articles}
            consultationFee={clinicSettings.consultationFee}
          />
        )}

        {activeTab === 'library' && (
          <HealthLibrary
            articles={articles}
            onBookCategory={(cat, notes) => handleOpenBooking(cat, notes)}
          />
        )}

        {activeTab === 'portal' && (
          <PatientPortal
            onOpenBooking={() => handleOpenBooking()}
            onOpenTriage={() => setIsTriageOpen(true)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            clinicSettings={clinicSettings}
            onUpdateSettings={setClinicSettings}
            articles={articles}
            onUpdateArticles={setArticles}
          />
        )}
      </main>

      {/* 4. Footer */}
      <Footer
        setActiveTab={setActiveTab}
        onOpenBooking={() => handleOpenBooking()}
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
      />

      {/* 5. Mobile Sticky Quick Action Bar (Thumb zone, capped at <15% viewport height) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 p-2.5 bg-white/95 backdrop-blur-md border-t border-[#CCD8CF] shadow-lg flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleOpenBooking()}
          className="flex-1 py-2.5 px-3 rounded-xl bg-[#1D4D43] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
        >
          <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Book Slot (₹{clinicSettings.consultationFee})</span>
        </button>
        <a
          href={`https://wa.me/${DOCTOR_PROFILE.whatsappNumber}?text=${encodeURIComponent("Hello Dr. Harshika, I am interested in an online consultation.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 px-3 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-98"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </a>
      </div>

      {/* 6. Modals */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialCategory={bookingCategory}
        initialNotes={bookingNotes}
        currentUserId={auth.currentUser?.uid}
        userEmail={auth.currentUser?.email || ''}
        userName={auth.currentUser?.displayName || ''}
        consultationFee={clinicSettings.consultationFee}
        followupFee={clinicSettings.followupFee}
      />

      <SymptomTriageModal
        isOpen={isTriageOpen}
        onClose={() => setIsTriageOpen(false)}
        onProceedToBooking={handleTriageComplete}
      />

      <MedicalDisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />

      {/* 7. AI Clinical Assistant Chatbot */}
      <ClinicChatbot
        onOpenBooking={() => handleOpenBooking()}
        onOpenTriage={() => setIsTriageOpen(true)}
      />
    </div>
  );
}
