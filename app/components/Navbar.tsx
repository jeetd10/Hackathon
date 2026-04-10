// app/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { Trophy, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { Level } from '../lib/useRewards';
import { ACHIEVEMENTS } from '../lib/useRewards';

interface NavbarProps {
  level: Level;
  levelProgress: number;
  totalXP: number;
  unlockedAchievements: Set<string>;
}

export default function Navbar({
  level,
  levelProgress,
  totalXP,
  unlockedAchievements,
}: NavbarProps) {
  const [showAchievements, setShowAchievements] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 24, stiffness: 140, delay: 0.1 }}
        className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-glass-border px-6 py-3"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              className="relative size-9 rounded-[10px] bg-electric-blue flex items-center justify-center shadow-[0_0_15px_-3px_rgba(214,160,138,0.4)] overflow-hidden"
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="relative z-10">
                <rect x="3" y="3" width="18" height="18" rx="4" stroke="white" strokeWidth="2" />
                <circle cx="12" cy="12" r="3" fill="white" />
              </svg>
            </motion.div>
            <span className="font-semibold text-base text-white tracking-tight leading-none">
              Aura OS
            </span>
          </Link>

          {/* Center: Level & XP Bar */}
          <div className="hidden sm:flex items-center gap-4">
            <motion.div
              className="flex items-center gap-3 px-4 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06]"
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <motion.span
                className="text-lg"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                {level.emoji}
              </motion.span>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-white/80 tracking-tight">
                    {level.name}
                  </span>
                  <span className="text-[10px] text-white/25 font-mono">{totalXP} XP</span>
                </div>
                <div className="w-28 h-1 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #D6A08A, #E5C3A6, #9CAD8A)',
                    }}
                    animate={{ width: `${levelProgress * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Achievements */}
          <div className="relative">
            <motion.button
              onClick={() => setShowAchievements(!showAchievements)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-white/80 transition-colors"
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              whileTap={{ scale: 0.96 }}
            >
              <Trophy className="size-4 text-[#E5C3A6]" />
              <span className="text-[12px] font-bold">
                {unlockedAchievements.size}/{ACHIEVEMENTS.length}
              </span>
              <ChevronDown
                className={`size-3 transition-transform duration-200 ${showAchievements ? 'rotate-180' : ''}`}
              />
            </motion.button>

            {/* Achievement dropdown */}
            <AnimatePresence>
              {showAchievements && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="absolute right-0 top-full mt-2 w-72 rounded-2xl glass border border-white/10 shadow-2xl p-4 flex flex-col gap-2 z-50"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-1">
                    Achievements
                  </span>
                  {ACHIEVEMENTS.map((ach) => {
                    const unlocked = unlockedAchievements.has(ach.id);
                    return (
                      <div
                        key={ach.id}
                        className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                          unlocked ? 'bg-white/[0.04]' : 'opacity-40'
                        }`}
                      >
                        <span className={`text-xl ${unlocked ? '' : 'grayscale'}`}>
                          {ach.emoji}
                        </span>
                        <div className="flex flex-col flex-grow min-w-0">
                          <span
                            className={`text-[12px] font-semibold tracking-tight ${
                              unlocked ? 'text-white/80' : 'text-white/30'
                            }`}
                          >
                            {ach.name}
                          </span>
                          <span className="text-[10px] text-white/25 truncate">
                            {ach.description}
                          </span>
                        </div>
                        {unlocked && (
                          <div className="size-5 rounded-full bg-[#9CAD8A]/20 flex items-center justify-center shrink-0">
                            <span className="text-[9px] text-[#9CAD8A]">✓</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.nav>

      {/* Backdrop for dropdown */}
      {showAchievements && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowAchievements(false)}
        />
      )}
    </>
  );
}