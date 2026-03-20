/**
 * @file auth.ts (lib)
 * @description Server-side authentication helper functions for Link-Wise.
 *
 * This module wraps the raw `next-auth` exports and exposes simplified helpers
 * for use throughout Server Components and Server Actions. It abstracts session
 * retrieval, login redirect, and logout redirect behind clean typed functions.
 *
 * All exports are marked `'use server'` so they can only be called from the
 * server boundary (Server Components, Server Actions, or Route Handlers).
 */
'use server';
import { auth as nextAuth, signIn as nextSignIn, signOut as nextSignOut } from '@/auth';
import type { User } from './definitions';

/**
 * Retrieves the current authenticated user's session data.
 *
 * Reads the NextAuth session cookie, maps it to the application's `User` type,
 * and augments it with custom DB properties (`isAdmin`, `isBlocked`, `name`)
 * that were injected by the `session` callback in `src/auth.ts`.
 *
 * @returns The current `User` if authenticated, or `null` if the session is missing.
 */
export async function getSession(): Promise<User | null> {
  const session = await nextAuth();
  if (!session?.user?.email) return null;
  
  return {
    id: session.user.email,
    name: session.user.name,
    isAdmin: (session.user as any).isAdmin || false,
    isBlocked: (session.user as any).isBlocked || false,
    createdAt: new Date().toISOString()
  };
}

/**
 * Initiates a Keycloak SSO login flow, redirecting the user to `/dashboard` on success.
 * Must be called from a Server Action (e.g. from a form action).
 */
export async function login() {
  await nextSignIn('keycloak', { redirectTo: '/dashboard' });
}

/**
 * Signs the user out and redirects them to the homepage.
 * Must be called from a Server Action (e.g. from a form action).
 */
export async function logout() {
  await nextSignOut({ redirectTo: '/' });
}

