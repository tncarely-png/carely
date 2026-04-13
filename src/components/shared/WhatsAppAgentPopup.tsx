'use client';

import { useState, useEffect, useCallback } from 'react';
import Avatar from 'boring-avatars';
import { X, MessageCircle } from 'lucide-react';

interface AgentInfo {
  id: string;
  name: string;
  phone: string;
  gender?: string | null;
  isActive: boolean;
  title?: string | null;
  emoji?: string | null;
}

const FALLBACK_AGENTS: AgentInfo[] = [
  {
    id: '1',
    name: 'Maram',
    phone: '21652013035',
    gender: 'female',
    isActive: true,
    title: 'الوكيلة الأولى',
    emoji: '👩',
  },
  {
    id: '2',
    name: 'Chafik',
    phone: '21626107128',
    gender: 'male',
    isActive: false,
    title: 'الوكيل الثاني',
    emoji: '👨',
  },
];

const AVATAR_COLORS_FEMALE = ['#1a8449', '#d4f0e3', '#094825', '#2ecc71', '#27ae60'];
const AVATAR_COLORS_MALE = ['#4b5563', '#d1d5db', '#1f2937', '#6b7280', '#374151'];

export function WhatsAppAgentPopup({
  open,
  onClose,
  message,
}: {
  open: boolean;
  onClose: () => void;
  message?: string;
}) {
  const [agents, setAgents] = useState<AgentInfo[]>(FALLBACK_AGENTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    fetch('/api/whatsapp-agent')
      .then((res) => res.json())
      .then((data) => {
        if (data.agents && data.agents.length > 0) {
          setAgents(data.agents);
        }
      })
      .catch(() => {
        // keep fallback
      })
      .finally(() => setLoading(false));
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const handleChat = useCallback(
    (agent: AgentInfo) => {
      if (!agent.isActive) return;
      const phone = agent.phone.replace('+', '');
      const msg =
        message ||
        'مرحبا Carely.tn، أريد الاستفسار عن الاشتراك';
      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
        '_blank',
        'noopener,noreferrer'
      );
      onClose();
    },
    [message, onClose]
  );

  if (!open) return null;

  const activeAgent = agents.find((a) => a.isActive);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Popup Card */}
      <div className="relative w-full max-w-md mx-4 mb-6 sm:mb-0 animate-in slide-in-from-bottom-4 fade-in duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 sm:-top-3 sm:-left-3 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors"
          aria-label="إغلاق"
        >
          <X className="h-4 w-4 text-carely-gray" />
        </button>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-carely-green px-6 py-4 text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <MessageCircle className="h-6 w-6 text-white" fill="white" />
            </div>
            <h3 className="text-lg font-extrabold text-white">تواصل معانا 💬</h3>
            <p className="text-sm text-green-100 mt-1">
              اختر الوكيل المتاح للتواصل على واتساب
            </p>
          </div>

          {/* Agent Cards */}
          <div className="p-5">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex gap-3">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-36 h-44 bg-gray-100 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex gap-4 justify-center">
                {agents.map((agent) => {
                  const isActive = agent.isActive;
                  const avatarColors =
                    agent.gender === 'female'
                      ? AVATAR_COLORS_FEMALE
                      : AVATAR_COLORS_MALE;

                  return (
                    <button
                      key={agent.id}
                      onClick={() => handleChat(agent)}
                      disabled={!isActive}
                      className={`
                        relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 w-40
                        ${
                          isActive
                            ? 'border-carely-green bg-carely-mint/50 hover:bg-carely-mint hover:shadow-lg hover:scale-[1.03] cursor-pointer'
                            : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed grayscale'
                        }
                      `}
                    >
                      {/* Active badge */}
                      {isActive && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-carely-green text-white text-[10px] font-bold px-3 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          متاح
                        </div>
                      )}

                      {!isActive && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gray-300 text-gray-600 text-[10px] font-bold px-3 py-0.5 rounded-full">
                          غير متاح
                        </div>
                      )}

                      {/* Avatar */}
                      <div
                        className={`w-16 h-16 rounded-full overflow-hidden ${
                          !isActive ? 'opacity-60' : ''
                        }`}
                      >
                        <Avatar
                          size={64}
                          name={agent.name}
                          variant="beam"
                          colors={avatarColors}
                        />
                      </div>

                      {/* Name + Title */}
                      <div className="text-center">
                        <p
                          className={`font-bold text-sm ${
                            isActive ? 'text-carely-dark' : 'text-gray-400'
                          }`}
                        >
                          {agent.emoji} {agent.name}
                        </p>
                        {agent.title && (
                          <p
                            className={`text-xs mt-0.5 ${
                              isActive ? 'text-carely-gray' : 'text-gray-300'
                            }`}
                          >
                            {agent.title}
                          </p>
                        )}
                      </div>

                      {/* Chat button */}
                      <div
                        className={`
                          flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full transition-all
                          ${
                            isActive
                              ? 'bg-[#25D366] text-white shadow-md'
                              : 'bg-gray-200 text-gray-400'
                          }
                        `}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        {isActive ? 'محادثة' : 'مغلق'}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Hint */}
            <p className="text-center text-xs text-carely-gray mt-4">
              {activeAgent
                ? `راح تتواصل مع ${activeAgent.name} — رد سريع مضمون ⚡`
                : 'لا يوجد وكلاء متاحين حالياً'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
