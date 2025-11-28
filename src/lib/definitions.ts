export type User = {
  id: string; // email
  createdAt: string;
  isBlocked: boolean;
  isAdmin: boolean;
  links?: Link[];
};

export type Link = {
  id: string; // short code
  originalUrl: string;
  userId: string | null;
  createdAt: string;
  expiresAt: string | null;
  hasPassword?: boolean;
  isDeleted: boolean;
  clicks: number;
};

export type Click = {
  id: number;
  linkId: string;
  clickedAt: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  countryCode?: string;
};

export type ShortenLinkResult = {
    shortUrl: string;
    originalUrl: string;
    qrCodeUrl: string;
}
