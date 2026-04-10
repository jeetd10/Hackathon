// app/lib/auth.ts
import { prisma } from './db';

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
}

// Automatically return a simulated "guest" user session
export async function getSession(): Promise<SessionPayload | null> {
  return {
    userId: 'default-guest-id',
    name: 'Friend',
    email: 'guest@aura.com',
  };
}

// These are no longer actively used since we removed the login page, but kept for type safety references if needed
export async function hashPassword(password: string): Promise<string> { return password; }
export async function verifyPassword(password: string, hash: string): Promise<boolean> { return true; }
export async function setSession(payload: SessionPayload): Promise<void> {}
export async function clearSession(): Promise<void> {}
