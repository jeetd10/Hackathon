// app/components/MoodSlider.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';

const moodStops = [
  { value: 0, label: 'Tranquil', emoji: '🌊', hue: 200, sat: 15 },
  { value: 20, label: 'Calm', emoji: '🍃', hue: 150, sat: 18 },
  { value: 40, label: 'Centered', emoji: '🧘', hue: 120, sat: 12 },
  { value: 50, label: 'Neutral', emoji: '☁️', hue: 30, sat: 5 },
  { value: 65, label: 'Focused', emoji: '⚡', hue: 40, sat: 20 },
  { value: 80, label: 'Energized', emoji: '🔥', hue: 25, sat: 25 },
  { value: 100, label: 'Radiant', emoji: '☀️', hue: 15, sat: 30 },
];

function interpolateMood(value: number) {
  let lower = moodStops[0];
  let upper = moodStops[moodStops.length - 1];

  for (let i = 0; i < moodStops.length - 1; i++) {
    if (value >= moodStops[i].value && value <= moodStops[i + 1].value) {
      lower = moodStops[i];
      upper = moodStops[i + 1];
      break;
    }
  }

  const range = upper.value - lower.value;
  const progress = range === 0 ? 0 : (value - lower.value) / range;

  return {
    label: progress < 0.5 ? lower.label : upper.label,
    emoji: progress < 0.5 ? lower.emoji : upper.emoji,
    hue: lower.hue + (upper.hue - lower.hue) * progress,
    sat: lower.sat + (upper.sat - lower.sat) * progress,
  };
}

export default function MoodSlider() {
  const [value, setValue] = useState(50);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLInputElement>(null);

  const mood = interpolateMood(value);

  // Apply background tint via CSS custom properties on the document
  useEffect(() => {
    const root = document.documentElement;
    // Subtle tint on the aurora background
    root.style.setProperty('--mood-hue', `${mood.hue}`);
    root.style.setProperty('--mood-sat', `${mood.sat}%`);
    root.style.setProperty('--mood-opacity', `${0.03 + (mood.sat / 30) * 0.04}`);

    return () => {
      root.style.removeProperty('--mood-hue');
      root.style.removeProperty('--mood-sat');
      root.style.removeProperty('--mood-opacity');
    };
  }, [mood.hue, mood.sat]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(parseInt(e.target.value, 10));
  };

  return (
    <>
      {/* Mood tint overlay - applies global color wash */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none transition-all duration-1000 ease-out"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, hsla(${mood.hue}, ${mood.sat}%, 50%, ${0.03 + (mood.sat / 30) * 0.04}) 0%, transparent 60%)`,
        }}
      />

      {/* Floating Widget */}
      <div className="fixed bottom-8 left-8 z-40">
        <AnimatePresence>
          {isExpanded ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass rounded-2xl p-5 w-[260px] shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="size-3.5 text-white/40" />
                  <span className="text-[11px] font-semibold tracking-widest text-white/40 uppercase">
                    Ambience
                  </span>
                </div>
                <motion.button
                  id="mood-slider-close"
                  onClick={() => setIsExpanded(false)}
                  className="size-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="size-3" />
                </motion.button>
              </div>

              {/* Current mood display */}
              <div className="flex items-center justify-center gap-3 mb-5">
                <motion.span
                  key={mood.emoji}
                  className="text-3xl"
                  initial={{ scale: 0.5, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                >
                  {mood.emoji}
                </motion.span>
                <div className="flex flex-col">
                  <motion.span
                    key={mood.label}
                    className="text-[14px] font-semibold text-white/80 tracking-tight"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {mood.label}
                  </motion.span>
                  <span className="text-[11px] text-white/30 font-mono">{value}/100</span>
                </div>
              </div>

              {/* Slider */}
              <div className="relative">
                <input
                  ref={sliderRef}
                  id="mood-slider-input"
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={handleChange}
                  onMouseDown={() => setIsDragging(true)}
                  onMouseUp={() => setIsDragging(false)}
                  onTouchStart={() => setIsDragging(true)}
                  onTouchEnd={() => setIsDragging(false)}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer mood-slider-track"
                  style={{
                    background: `linear-gradient(to right, 
                      hsl(200, 15%, 35%) 0%, 
                      hsl(150, 18%, 40%) 20%, 
                      hsl(120, 12%, 40%) 40%, 
                      hsl(40, 20%, 45%) 65%, 
                      hsl(25, 25%, 50%) 80%, 
                      hsl(15, 30%, 50%) 100%
                    )`,
                  }}
                />

                {/* Glow indicator at thumb position */}
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 size-4 rounded-full pointer-events-none"
                  style={{
                    left: `calc(${value}% - 8px)`,
                    background: `hsla(${mood.hue}, ${mood.sat}%, 50%, 0.6)`,
                    boxShadow: `0 0 ${isDragging ? '20' : '12'}px hsla(${mood.hue}, ${mood.sat}%, 50%, ${isDragging ? 0.5 : 0.3})`,
                  }}
                  animate={{
                    scale: isDragging ? 1.3 : 1,
                  }}
                  transition={{ duration: 0.15 }}
                />
              </div>

              {/* Mood stops */}
              <div className="flex justify-between mt-3 px-0.5">
                <span className="text-[9px] text-white/20 uppercase tracking-wider">Calm</span>
                <span className="text-[9px] text-white/20 uppercase tracking-wider">Energy</span>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="collapsed"
              id="mood-slider-toggle"
              onClick={() => setIsExpanded(true)}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <div
                className="absolute inset-0 rounded-full blur-xl opacity-40 group-hover:opacity-70 transition-opacity"
                style={{
                  background: `hsla(${mood.hue}, ${mood.sat}%, 50%, 0.5)`,
                }}
              />
              <div className="relative size-12 rounded-xl glass border border-white/10 flex items-center justify-center shadow-2xl">
                <SlidersHorizontal className="size-5 text-white/70" />
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
