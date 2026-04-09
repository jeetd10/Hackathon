// app/lib/storage.ts
// LocalStorage-based persistence layer for all mental health data

export interface MoodEntry {
  id: string;
  mood: string;
  emoji: string;
  value: number; // 0-100 wellbeing score
  color: string;
  timestamp: string; // ISO string
  note?: string;
}

export interface GratitudeEntry {
  id: string;
  text: string;
  timestamp: string;
}

export interface JournalEntry {
  id: string;
  text: string;
  mood?: string;
  timestamp: string;
}

export interface BreathingSession {
  id: string;
  durationSeconds: number;
  completedCycles: number;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  joinDate: string;
  streak: number;
  lastCheckInDate: string;
}

// ─── Keys ───
const KEYS = {
  MOODS: 'aura_moods',
  GRATITUDE: 'aura_gratitude',
  JOURNAL: 'aura_journal',
  BREATHING: 'aura_breathing',
  PROFILE: 'aura_profile',
} as const;

// ─── Helpers ───
function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── Profile ───
export function getProfile(): UserProfile {
  return getItem<UserProfile>(KEYS.PROFILE, {
    name: 'Alex',
    joinDate: new Date().toISOString(),
    streak: 0,
    lastCheckInDate: '',
  });
}

export function updateProfile(updates: Partial<UserProfile>): UserProfile {
  const current = getProfile();
  const updated = { ...current, ...updates };
  setItem(KEYS.PROFILE, updated);
  return updated;
}

// ─── Mood Entries ───
export function getMoodEntries(): MoodEntry[] {
  return getItem<MoodEntry[]>(KEYS.MOODS, []);
}

export function addMoodEntry(mood: Omit<MoodEntry, 'id' | 'timestamp'>): MoodEntry {
  const entries = getMoodEntries();
  const entry: MoodEntry = {
    ...mood,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };
  entries.push(entry);
  setItem(KEYS.MOODS, entries);

  // Update streak
  updateStreak();

  return entry;
}

export function getTodaysMood(): MoodEntry | null {
  const entries = getMoodEntries();
  const today = new Date().toDateString();
  return entries.find((e) => new Date(e.timestamp).toDateString() === today) || null;
}

export function getWeekMoods(): MoodEntry[] {
  const entries = getMoodEntries();
  const now = new Date();
  const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  return entries.filter((e) => new Date(e.timestamp) >= weekAgo);
}

export function getMoodStats(): { avgWellbeing: number; totalEntries: number; trend: number } {
  const weekMoods = getWeekMoods();
  if (weekMoods.length === 0) return { avgWellbeing: 0, totalEntries: 0, trend: 0 };

  const avg = Math.round(weekMoods.reduce((sum, m) => sum + m.value, 0) / weekMoods.length);

  // Calculate trend vs previous week
  const entries = getMoodEntries();
  const now = new Date();
  const twoWeeksAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13);
  const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  const prevWeek = entries.filter((e) => {
    const d = new Date(e.timestamp);
    return d >= twoWeeksAgo && d < weekAgo;
  });
  const prevAvg = prevWeek.length > 0
    ? Math.round(prevWeek.reduce((sum, m) => sum + m.value, 0) / prevWeek.length)
    : avg;

  return { avgWellbeing: avg, totalEntries: weekMoods.length, trend: avg - prevAvg };
}

// ─── Streak calculation ───
function updateStreak(): void {
  const profile = getProfile();
  const today = new Date().toDateString();
  const lastDate = profile.lastCheckInDate;

  if (lastDate === today) return; // Already checked in today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastDate === yesterday.toDateString()) {
    // Consecutive day
    updateProfile({ streak: profile.streak + 1, lastCheckInDate: today });
  } else if (!lastDate) {
    // First ever check-in
    updateProfile({ streak: 1, lastCheckInDate: today });
  } else {
    // Streak broken
    updateProfile({ streak: 1, lastCheckInDate: today });
  }
}

export function getStreak(): number {
  return getProfile().streak;
}

// ─── Gratitude Entries ───
export function getGratitudeEntries(): GratitudeEntry[] {
  return getItem<GratitudeEntry[]>(KEYS.GRATITUDE, []);
}

export function addGratitudeEntry(text: string): GratitudeEntry {
  const entries = getGratitudeEntries();
  const entry: GratitudeEntry = {
    id: generateId(),
    text,
    timestamp: new Date().toISOString(),
  };
  entries.push(entry);
  setItem(KEYS.GRATITUDE, entries);
  return entry;
}

export function getTodaysGratitude(): GratitudeEntry[] {
  const entries = getGratitudeEntries();
  const today = new Date().toDateString();
  return entries.filter((e) => new Date(e.timestamp).toDateString() === today);
}

export function getRecentGratitude(count: number = 10): GratitudeEntry[] {
  return getGratitudeEntries().slice(-count).reverse();
}

// ─── Breathing Sessions ───
export function getBreathingSessions(): BreathingSession[] {
  return getItem<BreathingSession[]>(KEYS.BREATHING, []);
}

export function addBreathingSession(durationSeconds: number, completedCycles: number): BreathingSession {
  const sessions = getBreathingSessions();
  const session: BreathingSession = {
    id: generateId(),
    durationSeconds,
    completedCycles,
    timestamp: new Date().toISOString(),
  };
  sessions.push(session);
  setItem(KEYS.BREATHING, sessions);
  return session;
}

export function getTotalBreathingMinutes(): number {
  const sessions = getBreathingSessions();
  return Math.round(sessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 60);
}

// ─── Utility: get last 7 days with data ───
export function getWeekChartData(): { day: string; date: string; mood: string; value: number; color: string; emoji: string }[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toDateString();
    const dayName = days[date.getDay()];

    // Find mood entry for this day
    const entries = getMoodEntries();
    const dayEntry = entries.find((e) => new Date(e.timestamp).toDateString() === dateStr);

    result.push({
      day: dayName,
      date: dateStr,
      mood: dayEntry?.mood || '',
      value: dayEntry?.value || 0,
      color: dayEntry?.color || 'rgba(255,255,255,0.1)',
      emoji: dayEntry?.emoji || '',
    });
  }

  return result;
}
