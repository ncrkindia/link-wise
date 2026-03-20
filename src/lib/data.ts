/**
 * @file data.ts
 * @description Server-side data fetching functions for the Link-Wise application.
 *
 * All functions in this module run exclusively on the server and interact directly
 * with the MySQL database via the shared connection pool from `lib/db.ts`.
 * They are consumed by Next.js Server Components (pages/layouts) to provide
 * pre-fetched data for rendering.
 *
 * Functions:
 *  - `getDashboardAnalytics` — Per-user aggregated stats for the dashboard.
 *  - `getAdminAnalytics`     — App-wide statistics for the admin panel.
 *  - `getUserLinks`          — All non-deleted links owned by a user.
 *  - `getAllUsers`            — All registered users (admin only).
 *  - `getAllLinks`            — All links (admin only).
 */
import { query } from './db';
import type { User, Link } from './definitions';


export const getDashboardAnalytics = async (userId: string) => {
    const userLinks = await query<any[]>('SELECT * FROM links WHERE user_id = ? AND is_deleted = FALSE', [userId]);
    const totalLinks = userLinks.length;
    
    const clicksRes = await query<any[]>('SELECT COUNT(*) as total FROM clicks c JOIN links l ON c.link_id = l.id WHERE l.user_id = ? AND l.is_deleted = FALSE', [userId]);
    const totalClicks = Number(clicksRes[0]?.total || 0);

    const topLinkRes = await query<any[]>(`
      SELECT l.*, COUNT(c.id) as clicks 
      FROM links l 
      LEFT JOIN clicks c ON l.id = c.link_id 
      WHERE l.user_id = ? AND l.is_deleted = FALSE 
      GROUP BY l.id 
      ORDER BY clicks DESC 
      LIMIT 1
    `, [userId]);
    
    let topLink = null;
    if (topLinkRes.length > 0) {
        topLink = {
            id: topLinkRes[0].id,
            originalUrl: topLinkRes[0].original_url,
            userId: topLinkRes[0].user_id,
            createdAt: String(topLinkRes[0].created_at),
            expiresAt: topLinkRes[0].expires_at ? String(topLinkRes[0].expires_at) : null,
            hasPassword: !!topLinkRes[0].password_hash,
            isDeleted: !!topLinkRes[0].is_deleted,
            isActive: !!topLinkRes[0].is_active,
            clicks: Number(topLinkRes[0].clicks)
        };
    }

    return {
        totalLinks,
        totalClicks,
        topLink,
    };
}

export const getAdminAnalytics = async () => {
    const linksRes = await query<any[]>('SELECT COUNT(*) as total FROM links');
    const totalLinks = Number(linksRes[0]?.total || 0);

    const clicksRes = await query<any[]>('SELECT COUNT(*) as total FROM clicks');
    const totalClicks = Number(clicksRes[0]?.total || 0);

    const usersRes = await query<any[]>('SELECT COUNT(*) as total FROM users');
    const totalUsers = Number(usersRes[0]?.total || 0);

    const activityRes = await query<any[]>(`
        SELECT DATE(created_at) as date, COUNT(*) as links, 0 as clicks
        FROM links
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    `);
    
    const linkActivity = activityRes.map(row => ({
        date: new Date(row.date).toISOString().split('T')[0],
        links: Number(row.links),
        clicks: 0
    }));

    return {
        totalLinks,
        totalClicks,
        totalUsers,
        linkActivity
    };
};

export const getUserLinks = async (userId: string) => {
    const links = await query<any[]>('SELECT l.*, COUNT(c.id) as clicks FROM links l LEFT JOIN clicks c ON l.id = c.link_id WHERE l.user_id = ? AND l.is_deleted = FALSE GROUP BY l.id', [userId]);
    return links.map(l => ({
        id: l.id,
        originalUrl: l.original_url,
        userId: l.user_id,
        createdAt: String(l.created_at),
        expiresAt: l.expires_at ? String(l.expires_at) : null,
        hasPassword: !!l.password_hash,
        isDeleted: !!l.is_deleted,
        isActive: !!l.is_active,
        clicks: Number(l.clicks)
    }));
};

export const getAllUsers = async () => {
    const users = await query<any[]>('SELECT * FROM users');
    return users.map(u => ({
        id: u.id,
        createdAt: String(u.created_at),
        isBlocked: !!u.is_blocked,
        isAdmin: !!u.is_admin
    }));
};

export const getAllLinks = async () => {
    const links = await query<any[]>('SELECT l.*, COUNT(c.id) as clicks FROM links l LEFT JOIN clicks c ON l.id = c.link_id GROUP BY l.id');
    return links.map(l => ({
        id: l.id,
        originalUrl: l.original_url,
        userId: l.user_id,
        createdAt: String(l.created_at),
        expiresAt: l.expires_at ? String(l.expires_at) : null,
        hasPassword: !!l.password_hash,
        isDeleted: !!l.is_deleted,
        isActive: !!l.is_active,
        clicks: Number(l.clicks)
    }));
}
