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
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name ?? profile.preferred_username,
          email: profile.email,
          image: profile.picture,
          // Explicitly map these so they are available in the 'profile' arg of signIn/jwt callbacks
          realm_access: profile.realm_access,
          resource_access: profile.resource_access,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      if (user?.email) {
        // Extract LW_ADMIN role from Keycloak profile (check both realm and resource access)
        const realmRoles = (profile as any)?.realm_access?.roles || [];
        const resourceRoles = (profile as any)?.resource_access?.['linkwise-client']?.roles || [];
        const isAdmin = realmRoles.includes('LW_ADMIN') || resourceRoles.includes('LW_ADMIN');

        // Ensure user exists and sync administrative status from Keycloak
        await query(
          'INSERT INTO users (id, name, is_admin) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), is_admin = VALUES(is_admin)',
          [user.email, user.name || null, isAdmin]
        );
      }
      return true;
    },
    async jwt({ token, account, profile }) {
      // Capture the ID token and roles from Keycloak on initial sign-in
      if (account && profile) {
        token.id_token = account.id_token;
        // Try getting roles from the profile (Userinfo)
        (token as any).realm_access = (profile as any).realm_access;
        (token as any).resource_access = (profile as any).resource_access;

        // Fallback: If roles are missing from the profile, decode the Access Token (manual JWT parse)
        if (!(token as any).realm_access && account.access_token) {
          try {
            const parts = account.access_token.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
              (token as any).realm_access = payload.realm_access;
              (token as any).resource_access = payload.resource_access;
            }
          } catch (e) {
            console.error("[AUTH] CRITICAL: Failed to decode access_token:", e);
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        // Pass the id_token from the JWT to the session for logout
        (session as any).id_token = token.id_token;

        // Perform JIT (Just-In-Time) user synchronization.
        // This ensures the user record exists locally even if the database was wiped while they remain logged in via OIDC.
        const tokenAny = token as any;
        const realmRoles = tokenAny.realm_access?.roles || [];
        const resourceRoles = tokenAny.resource_access?.['linkwise-client']?.roles || [];
        const isAdmin = realmRoles.includes('LW_ADMIN') || resourceRoles.includes('LW_ADMIN');

        // Defensive: Only sync to DB if we have a valid roles context to avoid accidental resets on tokens missing the claim
        const hasRolesContext = (token as any).realm_access || (token as any).resource_access;

        if (hasRolesContext) {
          await query(
            'INSERT INTO users (id, name, is_admin) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), is_admin = VALUES(is_admin)',
            [session.user.email, session.user.name || null, isAdmin]
          );
        }

        const users = await query<any[]>('SELECT * FROM users WHERE id = ? LIMIT 1', [session.user.email]);
        if (users.length > 0) {
          // Augment session object with custom database properties
          (session.user as any).isAdmin = !!users[0].is_admin;
          (session.user as any).isBlocked = !!users[0].is_blocked;
          if (users[0].name) {
            session.user.name = users[0].name;
          }
        }
      }
      return session;
    }
  }
});
