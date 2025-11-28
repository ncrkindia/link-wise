import type { User, Link } from './definitions';
import placeholderData from './placeholder-images.json';
export const placeholderImages = placeholderData.placeholderImages;

export const mockUsers: User[] = [
  {
    id: 'admin@linkwise.com',
    createdAt: new Date('2023-01-15T10:30:00Z').toISOString(),
    isBlocked: false,
    isAdmin: true,
  },
  {
    id: 'user1@example.com',
    createdAt: new Date('2023-02-20T14:00:00Z').toISOString(),
    isBlocked: false,
    isAdmin: false,
  },
  {
    id: 'user2@example.com',
    createdAt: new Date('2023-03-10T09:00:00Z').toISOString(),
    isBlocked: true,
    isAdmin: false,
  },
  {
    id: 'user3@example.com',
    createdAt: new Date('2023-05-01T18:45:00Z').toISOString(),
    isBlocked: false,
    isAdmin: false,
  },
];

export const mockLinks: Link[] = [
  {
    id: 'abc1234',
    originalUrl: 'https://example.com/very-long-url-that-needs-shortening-for-user1',
    userId: 'user1@example.com',
    createdAt: new Date('2023-08-01T10:00:00Z').toISOString(),
    expiresAt: null,
    hasPassword: true,
    isDeleted: false,
    clicks: 1254,
  },
  {
    id: 'def5678',
    originalUrl: 'https://another-example.com/another-long-url-for-sharing',
    userId: 'user1@example.com',
    createdAt: new Date('2023-08-05T15:30:00Z').toISOString(),
    expiresAt: new Date('2024-09-01T00:00:00Z').toISOString(),
    hasPassword: false,
    isDeleted: false,
    clicks: 832,
  },
  {
    id: 'ghi9012',
    originalUrl: 'https://some-other-domain.com/a-path/to-a-resource',
    userId: 'user2@example.com',
    createdAt: new Date('2023-08-02T11:00:00Z').toISOString(),
    expiresAt: null,
    hasPassword: false,
    isDeleted: false,
    clicks: 543,
  },
  {
    id: 'jkl3456',
    originalUrl: 'https://google.com',
    userId: 'admin@linkwise.com',
    createdAt: new Date('2023-08-08T09:00:00Z').toISOString(),
    expiresAt: null,
    hasPassword: false,
    isDeleted: false,
    clicks: 9876,
  },
    {
    id: 'mno7890',
    originalUrl: 'https://github.com/facebook/react',
    userId: 'user1@example.com',
    createdAt: new Date('2023-08-10T12:00:00Z').toISOString(),
    expiresAt: null,
    hasPassword: false,
    isDeleted: false,
    clicks: 234,
  },
  {
    id: 'pqr1122',
    originalUrl: 'https://news.ycombinator.com',
    userId: null, // Anonymous link
    createdAt: new Date('2023-08-11T14:20:00Z').toISOString(),
    expiresAt: null,
    hasPassword: false,
    isDeleted: false,
    clicks: 5678,
  },
];

mockUsers.forEach(user => {
    user.links = mockLinks.filter(link => link.userId === user.id);
});

export const getDashboardAnalytics = async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const userLinks = mockLinks.filter(link => link.userId === userId);
    const totalLinks = userLinks.length;
    const totalClicks = userLinks.reduce((acc, link) => acc + link.clicks, 0);
    const topLink = userLinks.sort((a,b) => b.clicks - a.clicks)[0];

    return {
        totalLinks,
        totalClicks,
        topLink,
    };
}

export const getAdminAnalytics = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const totalLinks = mockLinks.length;
    const totalClicks = mockLinks.reduce((acc, link) => acc + link.clicks, 0);
    const totalUsers = mockUsers.length;
    const linkActivity = [
        { date: '2023-08-01', links: 5, clicks: 1200 },
        { date: '2023-08-02', links: 7, clicks: 2300 },
        { date: '2023-08-03', links: 6, clicks: 1800 },
        { date: '2023-08-04', links: 9, clicks: 3200 },
        { date: '2023-08-05', links: 8, clicks: 2800 },
        { date: '2023-08-06', links: 12, clicks: 4500 },
        { date: '2023-08-07', links: 10, clicks: 3800 },
    ];

    return {
        totalLinks,
        totalClicks,
        totalUsers,
        linkActivity
    };
};

export const getUserLinks = async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockLinks.filter(link => link.userId === userId && !link.isDeleted);
};

export const getAllUsers = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockUsers;
};

export const getAllLinks = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockLinks;
}
