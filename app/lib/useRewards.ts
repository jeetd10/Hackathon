// app/lib/useRewards.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Types ───
export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  condition: (stats: RewardStats) => boolean;
}

export interface RewardStats {
  totalXP: number;
  moodLogs: number;
  breathingSessions: number;
  gratitudeEntries: number;
  intentionsSet: number;
  cognitiveCardsReviewed: number;
  heatmapDaysLogged: number;
  soundsLayered: number;
  maxSoundsLayered: number;
  currentStreak: number;
  longestStreak: number;
  totalActions: number;
}

export interface Level {
  tier: number;
  name: string;
  emoji: string;
  minXP: number;
}

export interface RewardEvent {
  type: 'xp' | 'level_up' | 'achievement';
  xpGained?: number;
  newLevel?: Level;
  achievement?: Achievement;
}

// ─── Constants ───
export const LEVELS: Level[] = [
  { tier: 1, name: 'Seedling', emoji: '🌱', minXP: 0 },
  { tier: 2, name: 'Sprout', emoji: '🌿', minXP: 100 },
  { tier: 3, name: 'Sapling', emoji: '🌳', minXP: 300 },
  { tier: 4, name: 'Kindling', emoji: '🔥', minXP: 600 },
  { tier: 5, name: 'Luminary', emoji: '⭐', minXP: 1000 },
  { tier: 6, name: 'Crystal Mind', emoji: '💎', minXP: 1800 },
  { tier: 7, name: 'Transcendent', emoji: '🧬', minXP: 3000 },
  { tier: 8, name: 'Cosmic Awareness', emoji: '🌌', minXP: 5000 },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_breath',
    name: 'First Breath',
    description: 'Complete your first breathing session',
    emoji: '💨',
    condition: (s) => s.breathingSessions >= 1,
  },
  {
    id: 'streak_3',
    name: 'Streak Starter',
    description: 'Maintain a 3-day streak',
    emoji: '🔥',
    condition: (s) => s.longestStreak >= 3,
  },
  {
    id: 'thought_guardian',
    name: 'Thought Guardian',
    description: 'Review all 10 cognitive distortion cards',
    emoji: '🛡️',
    condition: (s) => s.cognitiveCardsReviewed >= 10,
  },
  {
    id: 'gratitude_guru',
    name: 'Gratitude Guru',
    description: 'Write 10 gratitude entries',
    emoji: '🙏',
    condition: (s) => s.gratitudeEntries >= 10,
  },
  {
    id: 'sound_healer',
    name: 'Sound Healer',
    description: 'Layer 3+ ambient sounds simultaneously',
    emoji: '🎵',
    condition: (s) => s.maxSoundsLayered >= 3,
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Fill entire mood heatmap for a week',
    emoji: '🗓️',
    condition: (s) => s.heatmapDaysLogged >= 7,
  },
  {
    id: 'century',
    name: 'Century',
    description: 'Complete 100 total wellness actions',
    emoji: '💯',
    condition: (s) => s.totalActions >= 100,
  },
  {
    id: 'mood_master',
    name: 'Mood Master',
    description: 'Log your mood 7 times',
    emoji: '🎭',
    condition: (s) => s.moodLogs >= 7,
  },
  {
    id: 'intention_setter',
    name: 'Intention Setter',
    description: 'Set 5 daily intentions',
    emoji: '🎯',
    condition: (s) => s.intentionsSet >= 5,
  },
];

export const XP_VALUES = {
  mood_log: 20,
  breathing_session: 30,
  gratitude_entry: 15,
  intention_set: 10,
  cognitive_card: 5,
  heatmap_log: 10,
  sound_layer: 5,
} as const;

const STORAGE_KEY = 'aura-rewards';

function getDefaultStats(): RewardStats {
  return {
    totalXP: 0,
    moodLogs: 0,
    breathingSessions: 0,
    gratitudeEntries: 0,
    intentionsSet: 0,
    cognitiveCardsReviewed: 0,
    heatmapDaysLogged: 0,
    soundsLayered: 0,
    maxSoundsLayered: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalActions: 0,
  };
}

export function getLevel(xp: number): Level {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.minXP) current = level;
  }
  return current;
}

export function getNextLevel(xp: number): Level | null {
  for (const level of LEVELS) {
    if (xp < level.minXP) return level;
  }
  return null;
}

export function getLevelProgress(xp: number): number {
  const current = getLevel(xp);
  const next = getNextLevel(xp);
  if (!next) return 1;
  const range = next.minXP - current.minXP;
  const progress = xp - current.minXP;
  return Math.min(progress / range, 1);
}

// ─── Hook ───
export function useRewards() {
  const [stats, setStats] = useState<RewardStats>(getDefaultStats);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
  const [pendingEvents, setPendingEvents] = useState<RewardEvent[]>([]);
  const prevLevelRef = useRef<number>(1);
  const isInitializedRef = useRef(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.stats) setStats(parsed.stats);
        if (parsed.achievements) setUnlockedAchievements(new Set(parsed.achievements));
        prevLevelRef.current = getLevel(parsed.stats?.totalXP ?? 0).tier;
      }
    } catch {}
    isInitializedRef.current = true;
  }, []);

  // Persist to localStorage
  const persist = useCallback((newStats: RewardStats, newAchievements: Set<string>) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ stats: newStats, achievements: [...newAchievements] })
    );
  }, []);

  // Dismiss one event from the queue
  const dismissEvent = useCallback(() => {
    setPendingEvents((prev) => prev.slice(1));
  }, []);

  // Core: award XP and check for level-ups + achievements
  const awardXP = useCallback(
    (action: keyof typeof XP_VALUES, extraStatUpdates?: Partial<RewardStats>) => {
      if (!isInitializedRef.current) return;

      const xp = XP_VALUES[action];
      const events: RewardEvent[] = [];

      setStats((prev) => {
        const newStats: RewardStats = {
          ...prev,
          totalXP: prev.totalXP + xp,
          totalActions: prev.totalActions + 1,
          ...extraStatUpdates,
        };

        // XP event
        events.push({ type: 'xp', xpGained: xp });

        // Level-up check
        const newLevel = getLevel(newStats.totalXP);
        if (newLevel.tier > prevLevelRef.current) {
          events.push({ type: 'level_up', newLevel });
          prevLevelRef.current = newLevel.tier;
        }

        // Achievement check
        setUnlockedAchievements((prevAch) => {
          const newAch = new Set(prevAch);
          for (const achievement of ACHIEVEMENTS) {
            if (!newAch.has(achievement.id) && achievement.condition(newStats)) {
              newAch.add(achievement.id);
              events.push({ type: 'achievement', achievement });
            }
          }
          persist(newStats, newAch);
          return newAch;
        });

        return newStats;
      });

      // Queue events for display
      if (events.length > 0) {
        setPendingEvents((prev) => [...prev, ...events]);
      }
    },
    [persist]
  );

  // Convenience methods
  const logMood = useCallback(
    () => awardXP('mood_log', { moodLogs: stats.moodLogs + 1 }),
    [awardXP, stats.moodLogs]
  );

  const logBreathing = useCallback(
    () => awardXP('breathing_session', { breathingSessions: stats.breathingSessions + 1 }),
    [awardXP, stats.breathingSessions]
  );

  const logGratitude = useCallback(
    () => awardXP('gratitude_entry', { gratitudeEntries: stats.gratitudeEntries + 1 }),
    [awardXP, stats.gratitudeEntries]
  );

  const logIntention = useCallback(
    () => awardXP('intention_set', { intentionsSet: stats.intentionsSet + 1 }),
    [awardXP, stats.intentionsSet]
  );

  const logCognitiveCard = useCallback(
    () =>
      awardXP('cognitive_card', {
        cognitiveCardsReviewed: stats.cognitiveCardsReviewed + 1,
      }),
    [awardXP, stats.cognitiveCardsReviewed]
  );

  const logHeatmapDay = useCallback(
    () => awardXP('heatmap_log', { heatmapDaysLogged: stats.heatmapDaysLogged + 1 }),
    [awardXP, stats.heatmapDaysLogged]
  );

  const logSoundLayer = useCallback(
    (activeSoundsCount: number) =>
      awardXP('sound_layer', {
        soundsLayered: activeSoundsCount,
        maxSoundsLayered: Math.max(stats.maxSoundsLayered, activeSoundsCount),
      }),
    [awardXP, stats.maxSoundsLayered]
  );

  const level = getLevel(stats.totalXP);
  const nextLevel = getNextLevel(stats.totalXP);
  const levelProgress = getLevelProgress(stats.totalXP);

  return {
    stats,
    level,
    nextLevel,
    levelProgress,
    unlockedAchievements,
    pendingEvents,
    dismissEvent,
    logMood,
    logBreathing,
    logGratitude,
    logIntention,
    logCognitiveCard,
    logHeatmapDay,
    logSoundLayer,
  };
}
