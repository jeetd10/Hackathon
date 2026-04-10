// app/components/MoodHeatmap.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

const STORAGE_KEY = 'aura-mood-heatmap';

interface MoodEntry {
  day: string; // ISO date
  level: number; // 1-5
}

const moodLevels = [
  { level: 1, label: 'Low', color: '#73626A', emoji: '😞' },
  { level: 2, label: 'Anxious', color: '#A0969A', emoji: '😟' },
  { level: 3, label: 'Neutral', color: '#D3C4B3', emoji: '😐' },
  { level: 4, label: 'Balanced', color: '#9CAD8A', emoji: '😌' },
  { level: 5, label: 'Positive', color: '#D6A08A', emoji: '😊' },
];

function getWeekDays(): { date: string; label: string; isToday: boolean }[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7)); // Adjust to Monday

  const days = [];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    days.push({
      date: iso,
      label: dayNames[i],
      isToday: iso === today.toISOString().split('T')[0],
    });
  }
  return days;
}

interface MoodHeatmapProps {
  onMoodSet?: () => void;
}

export default function MoodHeatmap({ onMoodSet }: MoodHeatmapProps) {
  const [entries, setEntries] = useState<Record<string, number>>({});
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [weekDays] = useState(getWeekDays);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setEntries(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const saveEntries = useCallback((updated: Record<string, number>) => {
    setEntries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const handleSetMood = (day: string, level: number) => {
    const isNew = !entries[day];
    const updated = { ...entries, [day]: level };
    saveEntries(updated);
    setSelectedDay(null);
    if (isNew) onMoodSet?.();
  };

  const handleExportCSV = () => {
    const rows = ['Date,Mood Level,Mood Label'];
    weekDays.forEach((d) => {
      const level = entries[d.date];
      if (level) {
        const mood = moodLevels.find((m) => m.level === level);
        rows.push(`${d.date},${level},${mood?.label || 'Unknown'}`);
      } else {
        rows.push(`${d.date},,Not logged`);
      }
    });
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mood-heatmap-${weekDays[0].date}-to-${weekDays[6].date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filledCount = weekDays.filter((d) => entries[d.date]).length;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] text-white/30 uppercase tracking-wider font-semibold">
            {filledCount === 0
              ? 'Click a day to log your mood'
              : `${filledCount}/7 days logged this week`}
          </p>
        </div>
        <motion.button
          id="mood-heatmap-export"
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-semibold text-white/40 hover:text-white/70 uppercase tracking-wider transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Download className="size-3" />
          CSV
        </motion.button>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, i) => {
          const level = entries[day.date];
          const mood = level ? moodLevels.find((m) => m.level === level) : null;
          const isSelected = selectedDay === day.date;

          return (
            <motion.div
              key={day.date}
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              {/* Day label */}
              <span
                className={`text-[10px] font-semibold tracking-wider uppercase ${
                  day.isToday ? 'text-electric-blue' : 'text-white/30'
                }`}
              >
                {day.label}
              </span>

              {/* Cell */}
              <motion.button
                id={`mood-heatmap-${day.date}`}
                onClick={() => setSelectedDay(isSelected ? null : day.date)}
                className={`relative w-full aspect-square rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 border ${
                  day.isToday && !mood
                    ? 'border-electric-blue/30 bg-electric-blue/5'
                    : mood
                      ? 'border-opacity-40'
                      : 'border-white/[0.06] bg-white/[0.02]'
                }`}
                style={
                  mood
                    ? {
                        backgroundColor: `${mood.color}20`,
                        borderColor: `${mood.color}40`,
                      }
                    : undefined
                }
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {mood ? (
                  <span className="text-xl">{mood.emoji}</span>
                ) : (
                  <div className="size-2 rounded-full bg-white/10" />
                )}

                {/* Today indicator dot */}
                {day.isToday && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-electric-blue" />
                )}
              </motion.button>

              {/* Mood selector popover */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="absolute z-30 mt-1 flex flex-col gap-1 p-2 rounded-xl glass border border-white/10 shadow-2xl"
                    style={{ top: '100%' }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1 px-1">
                      <span className="text-[9px] text-white/30 font-semibold uppercase tracking-wider">
                        {day.label}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDay(null);
                        }}
                        className="text-white/30 hover:text-white/60"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                    {moodLevels.map((m) => (
                      <motion.button
                        key={m.level}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetMood(day.date, m.level);
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-all ${
                          entries[day.date] === m.level
                            ? 'bg-white/10'
                            : 'hover:bg-white/5'
                        }`}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <span className="text-sm">{m.emoji}</span>
                        <span className="text-[11px] text-white/60 font-medium">{m.label}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 pt-1">
        {moodLevels.map((m) => (
          <div key={m.level} className="flex items-center gap-1.5">
            <div
              className="size-2 rounded-full"
              style={{ backgroundColor: m.color }}
            />
            <span className="text-[9px] text-white/25 uppercase tracking-wider">
              {m.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
