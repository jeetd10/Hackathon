// app/components/NeuralHub.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Wind,
  Bookmark,
  Headphones,
  Brain,
  CalendarDays,
  Trophy,
} from 'lucide-react';
import type { Level } from '../lib/useRewards';

interface NeuralNode {
  id: string;
  label: string;
  lobe: string;
  icon: React.ElementType;
  color: string;
  description: string;
  angle: number; // degrees around the brain
  href: string;
}

const nodes: NeuralNode[] = [
  {
    id: 'mood',
    label: 'Mood Log',
    lobe: 'Prefrontal Cortex',
    icon: Target,
    color: '#D6A08A',
    description: 'Track emotional state',
    angle: -60,
    href: '#mood',
  },
  {
    id: 'breathing',
    label: 'Breathing',
    lobe: 'Brain Stem',
    icon: Wind,
    color: '#D3C4B3',
    description: 'Guided breathwork',
    angle: -120,
    href: '#breathe',
  },
  {
    id: 'gratitude',
    label: 'Gratitude',
    lobe: 'Limbic System',
    icon: Bookmark,
    color: '#9CAD8A',
    description: 'Positive journaling',
    angle: 180,
    href: '#journal',
  },
  {
    id: 'sounds',
    label: 'Soundscape',
    lobe: 'Auditory Cortex',
    icon: Headphones,
    color: '#8BA88A',
    description: 'Ambient sound layers',
    angle: 60,
    href: '#sounds',
  },
  {
    id: 'cognitive',
    label: 'Cognitive',
    lobe: 'Parietal Lobe',
    icon: Brain,
    color: '#E5C3A6',
    description: 'Thought patterns',
    angle: 0,
    href: '#learn',
  },
  {
    id: 'heatmap',
    label: 'Heatmap',
    lobe: 'Temporal Lobe',
    icon: CalendarDays,
    color: '#A0969A',
    description: 'Weekly overview',
    angle: 120,
    href: '#heatmap',
  },
];

interface NeuralHubProps {
  level: Level;
  levelProgress: number;
  totalXP: number;
  achievementCount: number;
  totalAchievements: number;
  userName: string;
  completedToday: Set<string>;
}

export default function NeuralHub({
  level,
  levelProgress,
  totalXP,
  achievementCount,
  totalAchievements,
  userName,
  completedToday,
}: NeuralHubProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsSmall(window.innerWidth <= 640);
    const handleResize = () => setIsSmall(window.innerWidth <= 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Brain glow intensity based on daily completions
  const brainGlow = Math.min(completedToday.size / 4, 1);

  const handleNodeClick = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative w-full min-h-[100vh] flex flex-col items-center justify-center overflow-hidden px-4 py-20">
      {/* ─── Floating Particles ─── */}
      {isMounted &&
        Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 2 + Math.random() * 4,
              height: 2 + Math.random() * 4,
              background: `rgba(214, 160, 138, ${0.15 + Math.random() * 0.25})`,
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              y: [0, -30 - Math.random() * 50, 0],
              x: [0, (Math.random() - 0.5) * 40, 0],
              opacity: [0.2, 0.5 + Math.random() * 0.3, 0.2],
            }}
            transition={{
              duration: 5 + Math.random() * 8,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'easeInOut',
            }}
          />
        ))}

      {/* ─── Level Badge (top) ─── */}
      <motion.div
        className="relative z-20 flex flex-col items-center gap-3 mb-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: 'spring', damping: 25 }}
      >
        <div className="flex items-center gap-3">
          <motion.span
            className="text-3xl"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {level.emoji}
          </motion.span>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">
              Level {level.tier}
            </span>
            <span className="text-lg font-bold text-white tracking-tight">{level.name}</span>
          </div>
        </div>

        {/* XP Progress bar */}
        <div className="w-48 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #D6A08A, #E5C3A6)' }}
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress * 100}%` }}
            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          />
        </div>
        <span className="text-[10px] text-white/20 font-mono">{totalXP} XP</span>
      </motion.div>

      {/* ─── Greeting ─── */}
      <motion.div
        className="text-center relative z-20 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
          Your Mind,{' '}
          <span className="text-gradient">{userName}</span>
        </h1>
        <p className="text-sm text-white/40 font-light">
          Tap a region to begin your session
        </p>
      </motion.div>

      {/* ─── Brain + Orbital Nodes ─── */}
      <div className="relative z-10">
        {/* SVG Connection Lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          style={{ overflow: 'visible' }}
          viewBox="-300 -300 600 600"
        >
          {nodes.map((node) => {
            const rad = (node.angle * Math.PI) / 180;
            const outerR = 220;
            const innerR = 80;
            const x1 = Math.cos(rad) * innerR;
            const y1 = Math.sin(rad) * innerR;
            const x2 = Math.cos(rad) * outerR;
            const y2 = Math.sin(rad) * outerR;
            const isHovered = hovered === node.id;
            const isDone = completedToday.has(node.id);

            return (
              <g key={`line-${node.id}`}>
                {/* Glow line */}
                <motion.line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={node.color}
                  strokeWidth={isHovered ? 2 : 1}
                  strokeOpacity={isDone ? 0.5 : isHovered ? 0.4 : 0.12}
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.8 + nodes.indexOf(node) * 0.1 }}
                />
                {/* Traveling pulse */}
                {isDone && (
                  <motion.circle
                    r={3}
                    fill={node.color}
                    opacity={0.6}
                    animate={{
                      cx: [x1, x2],
                      cy: [y1, y2],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Brain Image */}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 100, delay: 0.4 }}
        >
          {/* Brain glow */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, rgba(214,160,138,${0.08 + brainGlow * 0.15}) 0%, transparent 70%)`,
              filter: `blur(${20 + brainGlow * 20}px)`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <img
            src="/brain-hero.png"
            alt="Neural visualization"
            className="w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] object-contain relative z-10 drop-shadow-[0_0_40px_rgba(214,160,138,0.15)]"
            draggable={false}
          />
        </motion.div>

        {/* Orbital Nodes */}
        {nodes.map((node, i) => {
          const rad = (node.angle * Math.PI) / 180;
          const orbitRadius = isSmall ? 170 : 220;
          const x = Math.cos(rad) * orbitRadius;
          const y = Math.sin(rad) * orbitRadius;
          const isHovered = hovered === node.id;
          const isDone = completedToday.has(node.id);
          const Icon = node.icon;

          return (
            <motion.button
              key={node.id}
              id={`neural-node-${node.id}`}
              onClick={() => handleNodeClick(node.href)}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              className="absolute z-20 group cursor-pointer"
              style={{
                left: `calc(50% + ${x}px - 55px)`,
                top: `calc(50% + ${y}px - 40px)`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: 'spring',
                damping: 20,
                stiffness: 200,
                delay: 1 + i * 0.12,
              }}
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className={`relative w-[110px] rounded-2xl p-3 flex flex-col items-center gap-1.5 transition-all duration-300 border ${
                  isDone ? 'shadow-lg' : ''
                }`}
                style={{
                  background: isHovered
                    ? `${node.color}18`
                    : isDone
                      ? `${node.color}10`
                      : 'rgba(255,245,235,0.03)',
                  borderColor: isDone
                    ? `${node.color}50`
                    : isHovered
                      ? `${node.color}30`
                      : 'rgba(255,245,235,0.06)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: isDone
                    ? `0 0 25px ${node.color}20`
                    : isHovered
                      ? `0 0 20px ${node.color}15`
                      : 'none',
                }}
              >
                {/* Completion indicator */}
                {isDone && (
                  <div
                    className="absolute -top-1 -right-1 size-4 rounded-full flex items-center justify-center text-[8px] border"
                    style={{
                      background: node.color,
                      borderColor: `${node.color}80`,
                    }}
                  >
                    ✓
                  </div>
                )}

                <div
                  className="size-8 rounded-xl flex items-center justify-center transition-all duration-300"
                  style={{
                    background: `${node.color}15`,
                    color: node.color,
                  }}
                >
                  <Icon className="size-4" />
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider text-center leading-none transition-colors"
                  style={{
                    color: isHovered ? node.color : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {node.label}
                </span>
                <span className="text-[8px] text-white/20 uppercase tracking-wider">
                  {node.lobe}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ─── Achievement Summary (bottom) ─── */}
      <motion.div
        className="relative z-20 mt-8 flex items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/[0.06]">
          <Trophy className="size-3.5 text-[#E5C3A6]" />
          <span className="text-[11px] text-white/50 font-medium">
            {achievementCount}/{totalAchievements} Achievements
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/[0.06]">
          <span className="text-[11px] text-white/50 font-medium">
            {completedToday.size}/{nodes.length} Today
          </span>
        </div>
      </motion.div>

      {/* ─── Scroll indicator ─── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-[10px] text-white/20 uppercase tracking-widest">Scroll to explore</span>
        <div className="w-[1px] h-6 bg-gradient-to-b from-white/20 to-transparent" />
      </motion.div>
    </section>
  );
}
