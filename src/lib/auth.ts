'use server';
import { cookies } from 'next/headers';
import { mockUsers } from './data';
import type { User } from './definitions';

const COOKIE_NAME = 'linkwise-session';

export async function getSession(): Promise<User | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);

  if (!sessionCookie) {
    return null;
  }

  try {
    const user = JSON.parse(sessionCookie.value) as User;
    const foundUser = mockUsers.find(u => u.id === user.id);
    return foundUser || null;
  } catch {
    return null;
  }
}

export async function login(email: string): Promise<{ success: boolean; message: string }> {
  const user = mockUsers.find(u => u.id === email);

  if (!user) {
    return { success: false, message: 'Invalid credentials' };
  }
  
  if (user.isBlocked) {
    return { success: false, message: 'This account has been blocked.' };
  }

  const session = { id: user.id, isAdmin: user.isAdmin };
  cookies().set(COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/',
  });
  return { success: true, message: 'Logged in successfully' };
}

export async function logout() {
  cookies().delete(COOKIE_NAME);
}
