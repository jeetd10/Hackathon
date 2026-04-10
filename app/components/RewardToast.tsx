// app/components/RewardToast.tsx
'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RewardEvent } from '../lib/useRewards';

interface RewardToastProps {
  events: RewardEvent[];
  onDismiss: () => void;
}

export default function RewardToast({ events, onDismiss }: RewardToastProps) {
  const event = events[0]; // Show one at a time

  useEffect(() => {
    if (!event) return;
    const timeout = setTimeout(onDismiss, event.type === 'level_up' ? 4000 : event.type === 'achievement' ? 3500 : 2000);
    return () => clearTimeout(timeout);
  }, [event, onDismiss]);

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
      <AnimatePresence mode="wait">
        {event?.type === 'xp' && (
          <motion.div
            key={`xp-${Date.now()}`}
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-[#E5C3A6]/30 shadow-[0_0_30px_rgba(229,195,166,0.2)]"
          >
            <motion.span
              className="text-lg"
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.4 }}
            >
              ✨
            </motion.span>
            <span className="text-[13px] font-bold text-[#E5C3A6] tracking-wide">
              +{event.xpGained} XP
            </span>
          </motion.div>
        )}

        {event?.type === 'level_up' && event.newLevel && (
          <motion.div
            key={`level-${event.newLevel.tier}`}
            initial={{ opacity: 0, y: 40, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.7 }}
            transition={{ type: 'spring', damping: 18, stiffness: 200 }}
            className="flex flex-col items-center gap-2"
          >
            {/* Particle burst */}
            <div className="relative">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute size-1.5 rounded-full bg-[#E5C3A6]"
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{
                    x: Math.cos((i * 30 * Math.PI) / 180) * 60,
                    y: Math.sin((i * 30 * Math.PI) / 180) * 60,
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{ duration: 1, delay: 0.1, ease: 'easeOut' }}
                  style={{ left: '50%', top: '50%' }}
                />
              ))}
            </div>
            <motion.div
              className="px-6 py-4 rounded-2xl glass border border-[#E5C3A6]/40 shadow-[0_0_60px_rgba(229,195,166,0.3)] flex flex-col items-center gap-2"
              animate={{ boxShadow: ['0 0 30px rgba(229,195,166,0.2)', '0 0 60px rgba(229,195,166,0.4)', '0 0 30px rgba(229,195,166,0.2)'] }}
              transition={{ duration: 2, repeat: 1 }}
            >
              <motion.span
                className="text-4xl"
                animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6 }}
              >
                {event.newLevel.emoji}
              </motion.span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E5C3A6]">
                Level Up!
              </span>
              <span className="text-[15px] font-bold text-white tracking-tight">
                {event.newLevel.name}
              </span>
            </motion.div>
          </motion.div>
        )}

        {event?.type === 'achievement' && event.achievement && (
          <motion.div
            key={`ach-${event.achievement.id}`}
            initial={{ opacity: 0, y: 40, scale: 0.7, rotateX: 30 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: -30, scale: 0.8 }}
            transition={{ type: 'spring', damping: 18, stiffness: 200 }}
            className="px-6 py-4 rounded-2xl glass border border-[#9CAD8A]/40 shadow-[0_0_40px_rgba(156,173,138,0.25)] flex items-center gap-4"
          >
            <motion.span
              className="text-3xl"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {event.achievement.emoji}
            </motion.span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9CAD8A]">
                Achievement Unlocked
              </span>
              <span className="text-[14px] font-bold text-white tracking-tight">
                {event.achievement.name}
              </span>
              <span className="text-[11px] text-white/40 font-light">
                {event.achievement.description}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
