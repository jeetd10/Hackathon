// app/api/gratitude/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../lib/db';
import { getSession } from '../../lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const todaysEntries = await prisma.gratitudeEntry.findMany({
    where: { userId: session.userId, createdAt: { gte: todayStart } },
    orderBy: { createdAt: 'desc' },
  });

  const recentEntries = await prisma.gratitudeEntry.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return NextResponse.json({ todaysEntries, recentEntries });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { text } = await req.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });
  }

  const entry = await prisma.gratitudeEntry.create({
    data: { text: text.trim(), userId: session.userId },
  });

  return NextResponse.json({ entry });
}
