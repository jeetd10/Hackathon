// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, LineChart, Target, Sparkles, Wind, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from './components/Navbar';
import MoodTracker from './components/MoodTracker';
import MoodChart from './components/MoodChart';
import ResourcesGrid from './components/ResourcesGrid';
import ChatBox from './components/ChatBox';
import BreathingOrb from './components/BreathingOrb';
import QuoteCard from './components/QuoteCard';
import GratitudeCard from './components/GratitudeCard';

// Structural entrance animation (Staggered Fade-in Slide)
const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const slideUp = {
  hidden: { opacity: 0, y: 50, filter: 'blur(10px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring' as const, damping: 28, stiffness: 120, mass: 1 },
  },
};

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [stats, setStats] = useState({ avgWellbeing: 0, trend: 0, totalEntries: 0 });
  const [streak, setStreak] = useState(0);
  const [breathingMins, setBreathingMins] = useState(0);
  const [userName, setUserName] = useState('...');
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then(data => {
        if (data.user) setUserName(data.user.name);
      })
      .catch(console.error);

    fetch('/api/moods')
      .then(res => res.json())
      .then(data => {
        if (data.stats) setStats(data.stats);
        if (data.streak !== undefined) setStreak(data.streak);
      })
      .catch(console.error);

    fetch('/api/breathing')
      .then(res => res.json())
      .then(data => {
        if (data.totalMinutes !== undefined) setBreathingMins(data.totalMinutes);
      })
      .catch(console.error);
  }, [refreshKey, router]);

  const handleDataChange = () => setRefreshKey((k) => k + 1);

  return (
    <>
      <Navbar />

      <main
        className="min-h-screen pt-28 pb-20 px-6 max-w-7xl mx-auto flex flex-col gap-8"
      >
        {/* ─── Hero / Structural Header ─── */}
        <motion.section
          variants={slideUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="relative glass rounded-2xl p-10 overflow-hidden"
        >
          {/* Subtle structural glows instead of organic blobs */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-electric-blue/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-[11px] font-semibold tracking-widest text-[#D6A08A] uppercase mb-4 block">
                Overview
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight leading-[1.1]">
                Good morning,{' '}
                <span className="text-white/40">{userName}</span>
              </h1>
              <p className="text-sm text-white/50 leading-relaxed font-light">
                Analyze your psychological metrics and track mindfulness duration. All data is securely encrypted.
              </p>
            </div>

            {/* Quick stats — crisp structural cards */}
            <motion.div
              className="flex gap-4 w-full lg:w-auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              {[
                { label: 'Streak', value: streak > 0 ? `${streak}d` : '0d' },
                { label: 'Wellbeing', value: stats.avgWellbeing > 0 ? `${stats.avgWellbeing}%` : '—' },
                { label: 'Mindful', value: breathingMins > 0 ? `${breathingMins}m` : '0m' },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="glass flex-1 lg:min-w-[120px] rounded-xl px-5 py-4 flex flex-col justify-center transition-all duration-300 hover:bg-white/[0.03]"
                >
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-white/40 mb-1">{stat.label}</span>
                  <span className="text-2xl font-bold text-white tracking-tight">{stat.value}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* ─── Main Grid: Log & Chart ─── */}
        <div id="dashboard" className="grid grid-cols-1 lg:grid-cols-[1.2fr,2fr] gap-8 scroll-mt-28">
           <motion.section 
             variants={slideUp} 
             initial="hidden"
             whileInView="show"
             viewport={{ once: true, margin: "-50px" }}
             className="glass rounded-2xl p-8 flex flex-col"
           >
            <div className="flex items-center gap-3 mb-8">
              <div className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <Target className="size-4 text-electric-blue" />
              </div>
              <h2 className="text-sm font-semibold tracking-tight text-white/90">Daily Log</h2>
            </div>
            <MoodTracker onMoodLogged={handleDataChange} />
          </motion.section>

          <motion.section 
            variants={slideUp} 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="glass rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <LineChart className="size-4 text-cyber-purple-light" />
              </div>
              <h2 className="text-sm font-semibold tracking-tight text-white/90">Analytics</h2>
            </div>
            <MoodChart key={refreshKey} />
          </motion.section>
        </div>

        {/* ─── Middle Row: Breathing & Journal ─── */}
        <div id="breathe" className="grid grid-cols-1 md:grid-cols-[1fr,1.5fr] gap-8 scroll-mt-28">
          <motion.section 
            variants={slideUp} 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="glass rounded-2xl p-8"
          >
             <div className="flex items-center gap-3 mb-6">
              <div className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <Wind className="size-4 text-white/60" />
              </div>
              <h2 className="text-sm font-semibold tracking-tight text-white/90">Breathing Apparatus</h2>
            </div>
            <BreathingOrb onSessionComplete={handleDataChange} />
          </motion.section>

          <motion.section 
            id="journal" 
            variants={slideUp} 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="flex flex-col gap-8 scroll-mt-28"
          >
            <QuoteCard />
            <GratitudeCard onSaved={handleDataChange} />
          </motion.section>
        </div>

        {/* ─── Resources ─── */}
        <motion.section 
          id="resources" 
          variants={slideUp} 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="scroll-mt-28"
        >
           <div className="flex items-center gap-3 mb-8">
            <div className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <BookOpen className="size-4 text-white/60" />
            </div>
            <h2 className="text-sm font-semibold tracking-tight text-white/90">Knowledge Base</h2>
          </div>
          <ResourcesGrid />
        </motion.section>
      </main>

      {/* ─── SaaS Chat Trigger ─── */}
      <motion.button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-8 right-8 z-40 group"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring' as const, damping: 20, stiffness: 300, delay: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="absolute inset-0 rounded-full bg-electric-blue blur-xl opacity-40 group-hover:opacity-70 transition-opacity" />
        <div className="relative size-14 rounded-xl bg-white border border-white/10 flex items-center justify-center shadow-2xl">
          <Bot className="size-6 text-black" />
        </div>
      </motion.button>

      <ChatBox isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}