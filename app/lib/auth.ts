// app/lib/auth.ts
import { prisma } from './db';

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
}

// Automatically return a simulated "guest" user session
export async function getSession(): Promise<SessionPayload | null> {
  try {
    let user = await prisma.user.findUnique({ where: { email: 'guest@aura.com' } });
    
    // Automatically create the guest user inside the DB if they don't exist yet
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: 'default-guest-id',
          name: 'Friend',
          email: 'guest@aura.com',
          password: 'no-password-needed',
        }
      });
    }

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
    };
  } catch (error) {
    console.error('Error auto-creating guest user:', error);
    return null;
  }
}

// These are no longer actively used since we removed the login page, but kept for type safety references if needed
export async function hashPassword(password: string): Promise<string> { return password; }
export async function verifyPassword(password: string, hash: string): Promise<boolean> { return true; }
export async function setSession(payload: SessionPayload): Promise<void> {}
export async function clearSession(): Promise<void> {}
