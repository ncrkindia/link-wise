/**
 * @file definitions.ts
 * @description Shared TypeScript type definitions used throughout the Link-Wise application.
 * These types represent the core data models returned by database queries and
 * passed between server/client components.
 */

/**
 * Represents a registered user in the Link-Wise system.
 * The `id` is the user's email imported from the Keycloak JWT token.
 */
export type User = {
  /** The user's email address, used as the primary key in the DB. */
  id: string;
  /** The user's display name synced from Keycloak on each login. */
  name?: string | null;
  /** ISO timestamp of when the user record was created. */
  createdAt: string;
  /** Whether the user has been blocked by an admin. */
  isBlocked: boolean;
  /** Whether the user has admin privileges. */
  isAdmin: boolean;
  /** Optional collection of links owned by this user. */
  links?: Link[];
};

/**
 * Represents a shortened link record stored in the database.
 */
export type Link = {
  /** The 6-character short code; forms the URL path segment (e.g. `/s/abc123`). */
  id: string;
  /** The full destination URL that the short link redirects to. */
  originalUrl: string;
  /** The ID (email) of the user who created the link, or null for anonymous links. */
  userId: string | null;
  /** ISO timestamp of when the link was created. */
  createdAt: string;
  /** Optional ISO timestamp after which the link should no longer redirect. */
  expiresAt: string | null;
  /** Whether the link requires a password before redirecting. */
  hasPassword?: boolean;
  /** Soft-delete flag; deleted links are hidden from users but kept in the DB. */
  isDeleted: boolean;
  /** Whether the link is currently active. Disabled links return a 404. */
  isActive: boolean;
  /** Aggregate count of all recorded clicks for this link. */
  clicks: number;
};

/**
 * Represents a single analytics click event recorded when a short link is visited.
 */
export type Click = {
  /** Auto-incremented primary key for the click record. */
  id: number;
  /** The short link ID this click belongs to. */
  linkId: string;
  /** ISO timestamp of when the click occurred. */
  clickedAt: string;
  /** The IP address of the visitor (may be null if unavailable). */
  ipAddress?: string;
  /** The user-agent string of the visitor's browser. */
  userAgent?: string;
  /** The HTTP referer header value, if present. */
  referrer?: string;
  /** Two-letter ISO country code derived from request headers (e.g. Vercel geo). */
  countryCode?: string;
};

/**
 * Result returned by the `shortenLink` server action on success.
 */
export type ShortenLinkResult = {
  /** The full short URL (e.g. `https://app.com/s/abc123`). */
  shortUrl: string;
  /** The original long URL that was shortened. */
  originalUrl: string;
  /** URL to the generated QR code image for the short link. */
  qrCodeUrl: string;
};
