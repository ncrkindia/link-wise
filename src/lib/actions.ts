'use server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { login as authLogin, logout as authLogout, getSession } from './auth';
import { revalidatePath } from 'next/cache';

const FormSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
  password: z.string().optional(),
  expiresAt: z.string().optional(),
});

export type ShortenState = {
  message?: string | null;
  shortUrl?: string;
  qrCodeUrl?: string;
  originalUrl?: string;
  errors?: {
    url?: string[];
    password?: string[];
    expiresAt?: string[];
  };
};

export async function shortenLink(prevState: ShortenState, formData: FormData): Promise<ShortenState> {
  const session = await getSession();

  const validatedFields = FormSchema.safeParse({
    url: formData.get('url'),
    password: formData.get('password'),
    expiresAt: formData.get('expiresAt'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Failed to shorten link.',
    };
  }

  const { url, password, expiresAt } = validatedFields.data;

  // In a real app, you would:
  // 1. Generate a unique short ID.
  // 2. Hash the password if it exists.
  // 3. Save the link, user ID (if logged in), password hash, and expiry to the database.
  // 4. Generate a real QR code.

  const shortId = Math.random().toString(36).substring(2, 8);
  const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
  
  console.log('New link created:', {
    userId: session?.id || 'anonymous',
    originalUrl: url,
    shortId,
    hasPassword: !!password,
    expiresAt,
  });

  return {
    message: 'Link shortened successfully!',
    shortUrl: `${domain}/${shortId}`,
    originalUrl: url,
    qrCodeUrl: '/qr-placeholder.svg', // Placeholder
  };
}


export async function login(prevState: { message: string }, formData: FormData) {
  const email = formData.get('email') as string;
  const result = await authLogin(email);
  if (result.success) {
    redirect('/dashboard');
  }
  return { message: result.message };
}

export async function logout() {
    await authLogout();
    redirect('/');
}

// Admin actions
export async function toggleUserBlock(userId: string) {
    const session = await getSession();
    if (!session?.isAdmin) {
        throw new Error("You are not authorized to perform this action.");
    }
    console.log(`Toggling block status for user ${userId}`);
    // In a real app, update the user's is_blocked status in the database.
    revalidatePath('/admin');
    return { message: `Toggled block status for user ${userId}`};
}

export async function deleteLink(linkId: string) {
    const session = await getSession();
    if (!session?.isAdmin) {
        throw new Error("You are not authorized to perform this action.");
    }
    console.log(`Deleting link ${linkId}`);
    // In a real app, mark the link as is_deleted in the database.
    revalidatePath('/admin');
    revalidatePath('/dashboard');
    return { message: `Deleted link ${linkId}` };
}
