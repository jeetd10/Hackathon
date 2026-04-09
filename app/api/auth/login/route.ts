// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { verifyPassword, setSession } from '../../../lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    await setSession({ userId: user.id, name: user.name, email: user.email });

    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
