// app/components/DailyIntention.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Check, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'aura-daily-intention';

interface StoredIntention {
  text: string;
  date: string;
  completed: boolean;
}

interface DailyIntentionProps {
  onIntentionSet?: () => void;
}

export default function DailyIntention({ onIntentionSet }: DailyIntentionProps) {
  const [intention, setIntention] = useState('');
  const [savedIntention, setSavedIntention] = useState<StoredIntention | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [justSaved, setJustSaved] = useState(false);

  const todayKey = new Date().toISOString().split('T')[0];

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: StoredIntention = JSON.parse(stored);
        if (parsed.date === todayKey) {
          setSavedIntention(parsed);
          setIsEditing(false);
        } else {
          // New day — clear old intention
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, [todayKey]);

  const handleSave = () => {
    if (!intention.trim()) return;
    const entry: StoredIntention = {
      text: intention.trim(),
      date: todayKey,
      completed: false,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
    setSavedIntention(entry);
    setIsEditing(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
    onIntentionSet?.();
  };

  const handleComplete = () => {
    if (!savedIntention) return;
    const updated = { ...savedIntention, completed: true };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSavedIntention(updated);
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSavedIntention(null);
    setIntention('');
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="input-mode"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 200 }}
            className="flex flex-col gap-3"
          >
            <div className="flex items-center gap-2.5 mb-1">
              <div className="size-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                <Crosshair className="size-3 text-electric-blue" />
              </div>
              <span className="text-[11px] font-semibold tracking-widest text-white/40 uppercase">
                Today&apos;s Intention
              </span>
            </div>

            <div className="flex gap-2">
              <input
                id="daily-intention-input"
                type="text"
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What is your single focus today?"
                className="flex-grow input-glow rounded-lg px-4 py-3 text-[13px] text-white placeholder:text-white/20 font-light bg-transparent"
                autoComplete="off"
              />
              <motion.button
                id="daily-intention-save"
                onClick={handleSave}
                disabled={!intention.trim()}
                className="px-5 py-3 rounded-lg bg-electric-blue text-white text-[12px] font-semibold tracking-wide disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 uppercase"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
              >
                Lock In
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="saved-mode"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 200 }}
            className="relative"
          >
            {/* Glow behind card when completed */}
            {savedIntention?.completed && (
              <motion.div
                className="absolute -inset-2 rounded-2xl opacity-30 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(156,173,138,0.3) 0%, transparent 70%)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
              />
            )}

            <div
              className={`relative rounded-xl p-5 border transition-all duration-500 ${
                savedIntention?.completed
                  ? 'bg-white/[0.04] border-[#9CAD8A]/30'
                  : 'bg-white/[0.02] border-white/[0.06]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-grow min-w-0">
                  {/* Animated checkmark circle */}
                  <motion.button
                    id="daily-intention-complete"
                    onClick={handleComplete}
                    disabled={savedIntention?.completed}
                    className={`relative mt-0.5 size-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                      savedIntention?.completed
                        ? 'bg-[#9CAD8A] border-[#9CAD8A] cursor-default'
                        : 'border-white/20 hover:border-electric-blue cursor-pointer'
                    }`}
                    whileTap={!savedIntention?.completed ? { scale: 0.85 } : undefined}
                  >
                    <AnimatePresence>
                      {savedIntention?.completed && (
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                        >
                          <Check className="size-3.5 text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-[11px] font-semibold tracking-widest text-white/30 uppercase">
                      {savedIntention?.completed ? 'Intention Achieved' : 'Today\'s Intention'}
                    </span>
                    <p
                      className={`text-[15px] font-medium tracking-tight leading-snug transition-all duration-500 ${
                        savedIntention?.completed
                          ? 'text-white/40 line-through decoration-[#9CAD8A]/50'
                          : 'text-white/90'
                      }`}
                    >
                      {savedIntention?.text}
                    </p>
                  </div>
                </div>

                <motion.button
                  id="daily-intention-reset"
                  onClick={handleReset}
                  className="size-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors shrink-0"
                  whileHover={{ scale: 1.1, rotate: -90 }}
                  whileTap={{ scale: 0.9 }}
                  title="Reset intention"
                >
                  <RotateCcw className="size-3" />
                </motion.button>
              </div>
            </div>

            <AnimatePresence>
              {justSaved && (
                <motion.p
                  className="text-[11px] text-emerald-400/80 font-mono mt-2"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  &gt; Intention locked in for {todayKey}.
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
