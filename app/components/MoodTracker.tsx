// app/components/MoodTracker.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const moods = [
  { emoji: '😊', label: 'Positive', value: 90, color: '#D6A08A' }, /* Soft Terracotta */
  { emoji: '😌', label: 'Balanced', value: 80, color: '#9CAD8A' }, /* Soft Sage */
  { emoji: '😐', label: 'Neutral', value: 55, color: '#D3C4B3' }, /* Warm Sand */
  { emoji: '😟', label: 'Anxious', value: 40, color: '#A0969A' }, /* Dusty Rose/Slate */
  { emoji: '😞', label: 'Low', value: 30, color: '#73626A' }, /* Muted Plum */
];

const diagnosticQuestions = [
  { id: 'q1', text: 'Have you consumed adequate water today?' },
  { id: 'q2', text: 'Did you achieve uninterrupted REM sleep last night?' },
  { id: 'q3', text: 'Has this specific emotional state persisted for more than 2 hours?' }
];

interface MoodTrackerProps {
  onMoodLogged?: () => void;
}

export default function MoodTracker({ onMoodLogged }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [hasLogged, setHasLogged] = useState(false);
  const [note, setNote] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/moods', { cache: 'no-store' }) // Enforce no-store client side as well
      .then(res => res.json())
      .then(data => {
        if (data.todayMood) {
          setSelectedMood(data.todayMood.mood);
          setHasLogged(true);
        }
        setIsDataLoaded(true);
      })
      .catch((e) => {
        console.error(e);
        setIsDataLoaded(true);
      });
  }, []);

  const handleMoodSelect = (label: string) => {
    if (hasLogged) return;
    setSelectedMood(label);
    setQuizAnswers({}); // reset quiz on new selection
  };
  
  const handleAnswer = (qid: string, isYes: boolean) => {
    setQuizAnswers(prev => ({ ...prev, [qid]: isYes }));
  };

  const handleLog = async () => {
    if (!selectedMood) return;
    const moodData = moods.find((m) => m.label === selectedMood);
    if (!moodData) return;

    // Combine answers with note
    const quizContext = diagnosticQuestions.map(q => `[${q.text}: ${quizAnswers[q.id] ? 'Yes' : 'No'}]`).join(' ');
    const finalNote = note ? `${note}\n\nDiagnostics: ${quizContext}` : `Diagnostics: ${quizContext}`;

    setIsLoading(true);

    try {
      const res = await fetch('/api/moods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: moodData.label,
          emoji: moodData.emoji,
          value: moodData.value,
          color: moodData.color,
          note: finalNote,
        })
      });

      if (res.ok) {
        setHasLogged(true);
        setNote('');
        onMoodLogged?.();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const activeMood = moods.find((m) => m.label === selectedMood);
  const allQuestionsAnswered = Object.keys(quizAnswers).length === diagnosticQuestions.length;

  if (!isDataLoaded) {
    return <div className="h-40 w-full skeleton-loader" />;
  }

  return (
    <div className="space-y-6">
      {/* Mood Selector Row */}
      <div className="grid grid-cols-5 gap-3">
        {moods.map((mood, i) => {
          const isSelected = selectedMood === mood.label;
          return (
            <motion.button
              key={mood.label}
              onClick={() => handleMoodSelect(mood.label)}
              className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl cursor-pointer transition-all duration-300 group ${hasLogged && !isSelected ? 'opacity-30 grayscale' : ''}`}
              style={{
                background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                border: isSelected ? `1px solid ${mood.color}80` : '1px solid rgba(255,255,255,0.05)',
              }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: 'spring' as const, stiffness: 400, damping: 25 }}
              whileHover={!hasLogged ? { scale: 1.05, y: -2, backgroundColor: 'rgba(255,255,255,0.06)' } : undefined}
              whileTap={!hasLogged ? { scale: 0.95 } : undefined}
              disabled={hasLogged && !isSelected}
            >
              {isSelected && (
                 <div
                   className="absolute inset-0 rounded-xl pointer-events-none opacity-40 mix-blend-screen"
                   style={{ boxShadow: `0 0 20px ${mood.color}` }}
                 />
              )}
              <span className="text-2xl relative z-10 transition-transform group-hover:scale-110">{mood.emoji}</span>
              <span
                className="text-[10px] font-medium tracking-wide relative z-10 uppercase transition-colors"
                style={{ color: isSelected ? mood.color : 'rgba(255,255,255,0.5)' }}
              >
                {mood.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedMood && !hasLogged && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex flex-col gap-6 pt-4 border-t border-white/5"
          >
            {/* Diagnostic Quiz Section */}
            <div className="flex flex-col gap-4">
               <h4 className="text-[11px] uppercase tracking-widest text-electric-blue font-semibold mb-2">
                 Diagnostic Verification
               </h4>
               <div className="space-y-4">
                 {diagnosticQuestions.map((q, i) => (
                   <motion.div 
                     key={q.id}
                     className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl glass border border-white/5"
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.1 }}
                   >
                     <p className="text-[13px] text-white/80 font-light flex-grow pr-4">{q.text}</p>
                     <div className="flex gap-2 shrink-0">
                       <button 
                         onClick={() => handleAnswer(q.id, true)}
                         className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-all ${quizAnswers[q.id] === true ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-transparent'}`}
                       >
                         Yes
                       </button>
                       <button 
                         onClick={() => handleAnswer(q.id, false)}
                         className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-all ${quizAnswers[q.id] === false ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-transparent'}`}
                       >
                         No
                       </button>
                     </div>
                   </motion.div>
                 ))}
               </div>
            </div>

            {/* Optional Note */}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="System Context / Journal Entry (optional)..."
              rows={2}
              className="w-full input-glow rounded-xl px-4 py-3 text-[13px] text-white placeholder:text-white/30 resize-none font-light mt-2"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {selectedMood && !hasLogged && (
          <motion.button
            key="log-btn"
            onClick={handleLog}
            disabled={isLoading || !allQuestionsAnswered}
            className={`w-full py-3.5 rounded-xl text-[13px] font-semibold tracking-wide text-white transition-all overflow-hidden relative group mt-4 ${(isLoading || !allQuestionsAnswered) ? 'opacity-30 cursor-not-allowed scale-100' : ''}`}
            style={{ backgroundColor: activeMood?.color }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={(!isLoading && allQuestionsAnswered) ? { scale: 1.02 } : undefined}
            whileTap={(!isLoading && allQuestionsAnswered) ? { scale: 0.98 } : undefined}
          >
            <div className={`absolute inset-0 bg-black/10 opacity-0 transition-opacity ${(!isLoading && allQuestionsAnswered) ? 'group-hover:opacity-100' : ''}`} />
            <span className="relative z-10">
              {isLoading ? 'Writing to memory...' : (!allQuestionsAnswered ? 'Complete Diagnostics to Commit' : `Commit "${selectedMood}" Status`)}
            </span>
          </motion.button>
        )}

        {hasLogged && (
          <motion.div
            key="confirmation"
            className="w-full py-3.5 rounded-xl text-center text-[13px] font-medium glass border border-white/10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <span className="text-white/50">Recorded for today.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}