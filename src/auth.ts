/**
 * @file auth.ts (root)
 * @description NextAuth.js v5 configuration for the Link-Wise application.
 *
 * Configures the Keycloak OpenID Connect provider for SSO authentication.
 * On each sign-in and session read, the following custom logic is applied:
 *
 * - `signIn` callback: Upserts the user record in MySQL using the Keycloak email
 *   as the primary key and updates their display name from the token.
 *
 * - `session` callback: Augments the NextAuth session with `isAdmin` and
 *   `isBlocked` flags read from the database, enabling role-based UI gates.
 *
 * Required environment variables:
 *   AUTH_KEYCLOAK_ID     — Keycloak client ID
 *   AUTH_KEYCLOAK_SECRET — Keycloak client secret
 *   AUTH_KEYCLOAK_ISSUER — Keycloak realm issuer URL
 *   AUTH_SECRET          — Random string for signing session tokens
 */
import NextAuth from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';
import { query } from './lib/db';


export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    KeycloakProvider({
      clientId: process.env.AUTH_KEYCLOAK_ID,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET,
      issuer: process.env.AUTH_KEYCLOAK_ISSUER,
      checks: ['state'], // Bypass PKCE issues locally
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      if (user?.email) {
        // Extract LW_ADMIN role from Keycloak profile
        const isAdmin = (profile as any)?.realm_access?.roles?.includes('LW_ADMIN') || false;

        // Ensure user exists and sync administrative status from Keycloak
        await query(
          'INSERT INTO users (id, name, is_admin) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), is_admin = VALUES(is_admin)',
          [user.email, user.name || null, isAdmin]
        );
      }
      return true;
    },
    async jwt({ token, account }) {
      // Capture the ID token from Keycloak on initial sign-in
      if (account) {
        token.id_token = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        // Pass the id_token from the JWT to the session
        (session as any).id_token = token.id_token;

        const users = await query<any[]>('SELECT * FROM users WHERE id = ? LIMIT 1', [session.user.email]);
        if (users.length > 0) {
          // Augment session object with custom database properties
          (session.user as any).isAdmin = !!users[0].is_admin;
          (session.user as any).isBlocked = !!users[0].is_blocked;
          if (users[0].name) {
             session.user.name = users[0].name;
          }
        } else {
          (session.user as any).isAdmin = false;
          (session.user as any).isBlocked = false;
        }
      }
      return session;
    }
  }
});
