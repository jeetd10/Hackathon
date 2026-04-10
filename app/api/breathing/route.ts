// app/api/breathing/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../lib/db';
import { getSession } from '../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const sessions = await prisma.breathingSession.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
    });

    const totalMinutes = Math.round(
      sessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 60
    );

    return NextResponse.json({ sessions, totalMinutes });
  } catch (err) {
    console.error('Prisma GET error in breathing:', err);
    return NextResponse.json({ sessions: [], totalMinutes: 0 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { durationSeconds, completedCycles } = await req.json();

  const entry = await prisma.breathingSession.create({
    data: { durationSeconds, completedCycles, userId: session.userId },
  });

  return NextResponse.json({ entry });
}
