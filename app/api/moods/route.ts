// app/api/moods/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../lib/db';
import { getSession } from '../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const now = new Date();
  const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);

  const moods = await prisma.moodEntry.findMany({
    where: { userId: session.userId, createdAt: { gte: weekAgo } },
    orderBy: { createdAt: 'asc' },
  });

  // Today's mood
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayMood = await prisma.moodEntry.findFirst({
    where: { userId: session.userId, createdAt: { gte: todayStart } },
    orderBy: { createdAt: 'desc' },
  });

  // Stats
  const avgWellbeing = moods.length > 0
    ? Math.round(moods.reduce((sum, m) => sum + m.value, 0) / moods.length)
    : 0;

  // Previous week for trend
  const twoWeeksAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13);
  const prevWeekMoods = await prisma.moodEntry.findMany({
    where: { userId: session.userId, createdAt: { gte: twoWeeksAgo, lt: weekAgo } },
  });
  const prevAvg = prevWeekMoods.length > 0
    ? Math.round(prevWeekMoods.reduce((sum, m) => sum + m.value, 0) / prevWeekMoods.length)
    : avgWellbeing;

  // Streak calculation
  let streak = 0;
  const allMoods = await prisma.moodEntry.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  });

  if (allMoods.length > 0) {
    const uniqueDays = [...new Set(allMoods.map(m => new Date(m.createdAt).toDateString()))];
    streak = 1;
    for (let i = 0; i < uniqueDays.length - 1; i++) {
      const current = new Date(uniqueDays[i]);
      const next = new Date(uniqueDays[i + 1]);
      const diffDays = (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24);
      if (Math.round(diffDays) === 1) {
        streak++;
      } else {
        break;
      }
    }
  }

  // Build 7-day chart data
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dateStr = date.toDateString();
    const dayMood = moods.find(m => new Date(m.createdAt).toDateString() === dateStr);
    chartData.push({
      day: days[date.getDay()],
      date: dateStr,
      mood: dayMood?.mood || '',
      value: dayMood?.value || 0,
      color: dayMood?.color || 'rgba(255,255,255,0.1)',
      emoji: dayMood?.emoji || '',
    });
  }

  return NextResponse.json({
    todayMood,
    chartData,
    stats: { avgWellbeing, trend: avgWellbeing - prevAvg, totalEntries: moods.length },
    streak,
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { mood, emoji, value, color, note } = await req.json();

  if (!mood || !emoji || value === undefined || !color) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const entry = await prisma.moodEntry.create({
    data: { mood, emoji, value, color, note, userId: session.userId },
  });

  return NextResponse.json({ entry });
}
