// app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { hashPassword, setSession } from '../../../lib/auth';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    // Create user
    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    // Set session
    await setSession({ userId: user.id, name: user.name, email: user.email });

    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
