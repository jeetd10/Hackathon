// app/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  LineChart,
  Target,
  Wind,
  Headphones,
  Brain,
  CalendarDays,
  Crosshair,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from './components/Navbar';
import NeuralHub from './components/NeuralHub';
import MoodTracker from './components/MoodTracker';
import MoodChart from './components/MoodChart';
import ChatBox from './components/ChatBox';
import BreathingOrb from './components/BreathingOrb';
import QuoteCard from './components/QuoteCard';
import GratitudeCard from './components/GratitudeCard';
import DailyIntention from './components/DailyIntention';
import AmbientSoundboard from './components/AmbientSoundboard';
import CognitiveCards from './components/CognitiveCards';
import MoodHeatmap from './components/MoodHeatmap';
import MoodSlider from './components/MoodSlider';
import RewardToast from './components/RewardToast';
import { useRewards, ACHIEVEMENTS } from './lib/useRewards';

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
  const [userName, setUserName] = useState('Explorer');
  const [refreshKey, setRefreshKey] = useState(0);
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
  const router = useRouter();

  const rewards = useRewards();

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

  const markCompleted = useCallback((id: string) => {
    setCompletedToday((prev) => new Set(prev).add(id));
  }, []);

  // Reward-aware handlers
  const handleMoodLogged = useCallback(() => {
    handleDataChange();
    rewards.logMood();
    markCompleted('mood');
  }, [rewards, markCompleted]);

  const handleBreathingComplete = useCallback(() => {
    handleDataChange();
    rewards.logBreathing();
    markCompleted('breathing');
  }, [rewards, markCompleted]);

  const handleGratitudeSaved = useCallback(() => {
    handleDataChange();
    rewards.logGratitude();
    markCompleted('gratitude');
  }, [rewards, markCompleted]);

  const handleIntentionSet = useCallback(() => {
    rewards.logIntention();
    markCompleted('mood'); // counts toward daily
  }, [rewards, markCompleted]);

  const handleCognitiveCardReviewed = useCallback(() => {
    rewards.logCognitiveCard();
    markCompleted('cognitive');
  }, [rewards, markCompleted]);

  const handleHeatmapLog = useCallback(() => {
    rewards.logHeatmapDay();
    markCompleted('heatmap');
  }, [rewards, markCompleted]);

  const handleSoundToggle = useCallback(
    (count: number) => {
      if (count > 0) {
        rewards.logSoundLayer(count);
        markCompleted('sounds');
      }
    },
    [rewards, markCompleted]
  );

  // Section header helper
  const SectionHeader = ({
    icon: Icon,
    color,
    title,
    subtitle,
  }: {
    icon: React.ElementType;
    color: string;
    title: string;
    subtitle?: string;
  }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
        <Icon className="size-4" style={{ color }} />
      </div>
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-white/90">{title}</h2>
        {subtitle && <p className="text-[11px] text-white/30 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <>
      <Navbar
        level={rewards.level}
        levelProgress={rewards.levelProgress}
        totalXP={rewards.stats.totalXP}
        unlockedAchievements={rewards.unlockedAchievements}
      />

      {/* ─── Reward Toast Notifications ─── */}
      <RewardToast events={rewards.pendingEvents} onDismiss={rewards.dismissEvent} />

      {/* ═══════════════════════════════════ */}
      {/* ═══   BRAIN HUB (Hero Section)  ═══ */}
      {/* ═══════════════════════════════════ */}
      <NeuralHub
        level={rewards.level}
        levelProgress={rewards.levelProgress}
        totalXP={rewards.stats.totalXP}
        achievementCount={rewards.unlockedAchievements.size}
        totalAchievements={ACHIEVEMENTS.length}
        userName={userName}
        completedToday={completedToday}
      />

      {/* ═══════════════════════════════════════ */}
      {/* ═══   DEEP-DIVE SECTIONS (Scroll)   ═══ */}
      {/* ═══════════════════════════════════════ */}
      <main className="relative z-20 pb-20 px-6 max-w-7xl mx-auto flex flex-col gap-8">
        {/* ─── Daily Intention ─── */}
        <motion.section
          id="intention"
          variants={slideUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="glass rounded-2xl p-8 scroll-mt-20"
        >
          <SectionHeader
            icon={Crosshair}
            color="#D6A08A"
            title="Daily Intention"
            subtitle="Set your focus for the day"
          />
          <DailyIntention onIntentionSet={handleIntentionSet} />
        </motion.section>

        {/* ─── Mood Log + Analytics Grid ─── */}
        <div
          id="mood"
          className="grid grid-cols-1 lg:grid-cols-[1.2fr,2fr] gap-8 scroll-mt-20"
        >
          <motion.section
            variants={slideUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
            className="glass rounded-2xl p-8 flex flex-col"
          >
            <SectionHeader icon={Target} color="#D6A08A" title="Daily Log" />
            <MoodTracker onMoodLogged={handleMoodLogged} />
          </motion.section>

          <div className="flex flex-col gap-8">
            <motion.section
              variants={slideUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-50px' }}
              className="glass rounded-2xl p-8"
            >
              <SectionHeader icon={LineChart} color="#B4C69F" title="Analytics" />
              <MoodChart key={refreshKey} />
            </motion.section>

            <motion.section
              id="heatmap"
              variants={slideUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-50px' }}
              className="glass rounded-2xl p-8 scroll-mt-20"
            >
              <SectionHeader
                icon={CalendarDays}
                color="#D6A08A"
                title="Weekly Heatmap"
                subtitle="Track mood patterns across the week"
              />
              <MoodHeatmap onMoodSet={handleHeatmapLog} />
            </motion.section>
          </div>
        </div>

        {/* ─── Breathing & Journal Row ─── */}
        <div
          id="breathe"
          className="grid grid-cols-1 md:grid-cols-[1fr,1.5fr] gap-8 scroll-mt-20"
        >
          <motion.section
            variants={slideUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
            className="glass rounded-2xl p-8"
          >
            <SectionHeader icon={Wind} color="#D3C4B3" title="Breathing Apparatus" />
            <BreathingOrb onSessionComplete={handleBreathingComplete} />
          </motion.section>

          <motion.section
            id="journal"
            variants={slideUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
            className="flex flex-col gap-8 scroll-mt-20"
          >
            <QuoteCard />
            <GratitudeCard onSaved={handleGratitudeSaved} />
          </motion.section>
        </div>

        {/* ─── Ambient Soundboard ─── */}
        <motion.section
          id="sounds"
          variants={slideUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="glass rounded-2xl p-8 scroll-mt-20"
        >
          <SectionHeader
            icon={Headphones}
            color="#9CAD8A"
            title="Ambient Soundscape"
            subtitle="Layer procedural sounds for focus or relaxation"
          />
          <AmbientSoundboard onSoundToggle={handleSoundToggle} />
        </motion.section>

        {/* ─── Cognitive Cards ─── */}
        <motion.section
          id="learn"
          variants={slideUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="glass rounded-2xl p-8 scroll-mt-20"
        >
          <SectionHeader
            icon={Brain}
            color="#E5C3A6"
            title="Cognitive Patterns"
            subtitle="Identify and challenge thought distortions"
          />
          <CognitiveCards onCardReviewed={handleCognitiveCardReviewed} />
        </motion.section>
      </main>

      {/* ─── Mood Slider (Floating Widget) ─── */}
      <MoodSlider />

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