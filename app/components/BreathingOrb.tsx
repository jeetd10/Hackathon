// app/components/BreathingOrb.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const phases = [
  { label: 'Inhale', duration: 4, scale: 1.6, color: '#D3C4B3' }, /* Sand */
  { label: 'Hold', duration: 4, scale: 1.6, color: '#E5C3A6' }, /* Peach */
  { label: 'Exhale', duration: 6, scale: 1.0, color: '#D6A08A' }, /* Terracotta */
  { label: 'Hold', duration: 2, scale: 1.0, color: '#A0969A' }, /* Slate */
];

interface BreathingOrbProps {
  onSessionComplete?: () => void;
}

export default function BreathingOrb({ onSessionComplete }: BreathingOrbProps) {
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef<number>(0);
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);

  const phase = phases[phaseIndex];

  useEffect(() => {
    if (!isActive) return;

    setCountdown(phase.duration);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          const nextPhase = (phaseIndex + 1) % phases.length;
          if (nextPhase === 0) setCompletedCycles((c) => c + 1);
          setPhaseIndex(nextPhase);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [isActive, phaseIndex, phase.duration]);

  useEffect(() => {
    if (isActive) {
      startTimeRef.current = Date.now();
      elapsedTimerRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    }
    return () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, [isActive]);

  const handleStart = () => {
    setIsActive(true);
    setPhaseIndex(0);
    setCompletedCycles(0);
    setElapsedSeconds(0);
    setCountdown(phases[0].duration);
  };

  const handleStop = async () => {
    setIsActive(false);
    if (elapsedSeconds > 5) {
      try {
        const res = await fetch('/api/breathing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ durationSeconds: elapsedSeconds, completedCycles })
        });
        if (res.ok) onSessionComplete?.();
      } catch (e) {
         console.error(e);
      }
    }
    setPhaseIndex(0);
    setCountdown(0);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-6">
      {/* Precision Orb Container */}
      <div className="relative size-40 flex items-center justify-center">
        {/* Crisp Expansion Rings */}
        <motion.div
          className="absolute inset-0 rounded-full border-[1px] border-white/20"
          animate={isActive ? { scale: phase.scale } : { scale: 1 }}
          transition={{ duration: phase.duration, ease: [0.25, 1, 0.5, 1] }}
          style={{ opacity: isActive ? 0.8 : 0.2, borderColor: phase.color }}
        />

        {/* Geometric Core */}
        <motion.div
          className="relative size-20 rounded-full flex items-center justify-center cursor-pointer shadow-[0_0_30px_0_rgba(0,112,243,0.3)] transition-all"
          style={{
            background: isActive ? phase.color : 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          animate={isActive ? { scale: phase.scale * 0.4 } : { scale: 1 }}
          transition={{ duration: phase.duration, ease: [0.25, 1, 0.5, 1] }}
          onClick={isActive ? undefined : handleStart}
          whileHover={!isActive ? { scale: 1.05, borderColor: '#0070F3' } : undefined}
          whileTap={!isActive ? { scale: 0.95 } : undefined}
        >
          {/* Inner content */}
          <AnimatePresence mode="wait">
            {isActive ? (
              <motion.span
                key="countdown"
                className="text-lg font-bold text-white tracking-widest z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{ position: 'absolute', transform: `scale(${1 / (phase.scale * 0.4)})` }}
              >
                {/* The number itself doesn't scale with the orb */}
                {countdown}
              </motion.span>
            ) : (
              <motion.span
                key="play"
                className="text-white/80 text-[11px] font-semibold tracking-wider uppercase z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Initiate
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="flex flex-col items-center gap-1 min-h-[40px]">
        <AnimatePresence mode="wait">
          <motion.p
            key={isActive ? phase.label + phaseIndex : 'idle'}
            className="text-[13px] font-medium tracking-wide text-white/50 uppercase"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            {isActive ? phase.label : 'Awaiting calibration'}
          </motion.p>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isActive && (
          <motion.div
            className="flex flex-col items-center gap-3 w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="flex items-center gap-6 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-white/40">
              <span>T-{formatTime(elapsedSeconds)}</span>
              <span>C-{completedCycles}</span>
            </div>
            <button
              onClick={handleStop}
              className="text-[11px] font-semibold text-white/30 hover:text-white uppercase tracking-wider transition-colors py-2"
            >
              Terminate Session
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
