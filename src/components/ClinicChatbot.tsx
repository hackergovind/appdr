import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, X, Send, Stethoscope, Sparkles, Calendar, 
  ArrowRight, Phone, RefreshCw, User, Bot, CheckCircle2 
} from 'lucide-react';
import { DOCTOR_PROFILE } from '../data/defaultData';
import { getClinicalFallbackResponse } from '../utils/clinicalAssistant';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ClinicChatbotProps {
  onOpenBooking: () => void;
  onOpenTriage: () => void;
}

const QUICK_SUGGESTIONS = [
  "Can I take homoeopathy with thyroid medicine?",
  "How do online consultations across India work?",
  "What is Dr. Harshika's approach to PCOS?",
  "How to prepare lab reports before consultation?",
  "What are the consultation fees?"
];

export const ClinicChatbot: React.FC<ClinicChatbotProps> = ({
  onOpenBooking,
  onOpenTriage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Namaste! I am the clinical assistant for Dr. Harshika Singh, BHMS, MD (Hom.).\n\nI can answer questions regarding our evidence-based homoeopathic approach to Hormonal Balance, Thyroid Care, Joint Wellness, online consultations, and fees. How may I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          messages: messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer from clinic desk');
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: data.reply || getClinicalFallbackResponse(text),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.warn('Chatbot fetch encountered issue, using instant clinical knowledge engine:', err);
      const fallbackMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: getClinicalFallbackResponse(text),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 p-3.5 sm:px-4 sm:py-3 rounded-full bg-[#1D4D43] hover:bg-[#163D35] text-white shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 group active:scale-95 border border-[#D4AF37]/50"
          title="Chat with Dr. Harshika's Clinic Desk"
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5 text-[#D4AF37]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="hidden sm:inline-block text-xs font-bold font-serif tracking-wide">
            Ask Clinic Desk
          </span>
        </button>
      )}

      {/* Expanded Chat Dialog */}
      {isOpen && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] h-[520px] max-h-[85vh] rounded-3xl bg-white shadow-2xl border border-[#CCD8CF] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
          <div className="bg-[#1D4D43] text-white p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-serif leading-tight">
                  Dr. Harshika's Clinic Desk
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-200 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Evidence-Based Homoeopathy Assistant</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-[#FBFBF9]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#1D4D43] text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5 font-serif text-[10px] font-bold">
                    H
                  </div>
                )}
                <div
                  className={`max-w-[85%] p-3 rounded-2xl leading-relaxed whitespace-pre-line shadow-xs ${
                    m.role === 'user'
                      ? 'bg-[#1D4D43] text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-[#DDE6E0] rounded-bl-xs'
                  }`}
                >
                  {m.content}
                  <div className={`text-[9px] mt-1 text-right ${m.role === 'user' ? 'text-emerald-200' : 'text-slate-400'}`}>
                    {m.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center text-slate-400 text-xs">
                <div className="w-6 h-6 rounded-full bg-[#1D4D43] text-[#D4AF37] flex items-center justify-center shrink-0 font-serif text-[10px] font-bold">
                  H
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1D4D43] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1D4D43] animate-bounce delay-150" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1D4D43] animate-bounce delay-300" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Carousel */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {QUICK_SUGGESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-[#F0F5F1] text-[#1D4D43] hover:bg-[#E8EFE9] border border-[#CCD8CF] whitespace-nowrap transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Quick Actions Strip */}
          <div className="px-3 py-1.5 bg-[#F8FAF8] border-t border-slate-100 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenBooking();
              }}
              className="text-[#1D4D43] font-bold hover:underline inline-flex items-center gap-1"
            >
              <Calendar className="w-3 h-3 text-[#D4AF37]" />
              <span>Book Slot (₹799)</span>
            </button>
            <a
              href={`https://wa.me/${DOCTOR_PROFILE.whatsappNumber}?text=${encodeURIComponent("Hello Dr. Harshika, I am reaching out from your website chatbot.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 font-semibold hover:underline inline-flex items-center gap-1"
            >
              <Phone className="w-3 h-3 text-emerald-600" />
              <span>WhatsApp Desk</span>
            </a>
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-[#DDE6E0] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about thyroid, PCOS, fees, slots..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#1D4D43] text-slate-800"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="p-2 rounded-xl bg-[#1D4D43] hover:bg-[#163D35] text-white disabled:bg-slate-200 disabled:text-slate-400 transition-colors shrink-0 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
