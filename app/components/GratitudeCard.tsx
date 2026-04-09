// components/GratitudeCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface GratitudeEntry {
  id: string;
  text: string;
  createdAt: string;
}

interface GratitudeCardProps {
  onSaved?: () => void;
}

export default function GratitudeCard({ onSaved }: GratitudeCardProps) {
  const [text, setText] = useState('');
  const [todaysEntries, setTodaysEntries] = useState<GratitudeEntry[]>([]);
  const [recentEntries, setRecentEntries] = useState<GratitudeEntry[]>([]);
  const [justSaved, setJustSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchGratitude = async () => {
    try {
      const res = await fetch('/api/gratitude');
      const data = await res.json();
      if (data.todaysEntries) setTodaysEntries(data.todaysEntries);
      if (data.recentEntries) setRecentEntries(data.recentEntries);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchGratitude(); }, []);

  const handleSave = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    try {
       const res = await fetch('/api/gratitude', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ text: text.trim() })
       });
       if (res.ok) {
          setText('');
          setJustSaved(true);
          setTimeout(() => setJustSaved(false), 2500);
          await fetchGratitude();
          onSaved?.();
       }
    } catch(e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date().toDateString();
    if (d.toDateString() === today) return 'Today';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="glass rounded-2xl p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <Bookmark className="size-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-white/90">System Logs (Gratitude)</h2>
            <p className="text-[11px] text-white/30 uppercase tracking-wider mt-0.5">
              {todaysEntries.length > 0
                ? `${todaysEntries.length} Event${todaysEntries.length > 1 ? 's' : ''} Logged`
                : 'Awaiting positive inputs'}
            </p>
          </div>
        </div>

        {recentEntries.length > 0 && (
          <motion.button
            onClick={() => setShowHistory(!showHistory)}
            className="size-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showHistory ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </motion.button>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="I am acknowledging..."
          rows={1}
          className="flex-grow input-glow rounded-lg px-4 py-3 text-[13px] text-white placeholder:text-white/20 resize-none font-light"
        />
        <motion.button
          onClick={handleSave}
          disabled={!text.trim() || isLoading}
          className="self-end size-11 rounded-lg bg-electric-blue flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed border border-white/10"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
        >
          <Check className="size-4" />
        </motion.button>
      </div>

      <AnimatePresence>
        {justSaved && (
          <motion.p
            className="text-[11px] text-emerald-400/80 font-mono"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            &gt; Entry successfully compiled into permanent memory.
          </motion.p>
        )}
      </AnimatePresence>

      {/* History view */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            className="space-y-3 max-h-48 overflow-y-auto pr-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {recentEntries.map((entry) => (
              <motion.div
                key={entry.id}
                className="flex items-start gap-3 p-3 rounded-md bg-white/5 border border-white/5"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="size-1.5 rounded-full bg-emerald-400/50 mt-1.5 shrink-0" />
                <span className="flex-grow text-[13px] text-white/70 font-light leading-relaxed">{entry.text}</span>
                <span className="text-[10px] text-white/20 shrink-0 uppercase whitespace-nowrap">{formatDate(entry.createdAt)}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
