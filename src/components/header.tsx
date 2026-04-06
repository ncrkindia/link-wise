/**
 * @file components/header.tsx
 * @description Global site header (sticky, top navigation bar).
 *
 * This Server Component reads the current session and renders a context-aware
 * navigation bar:
 *  - **Unauthenticated**: Shows a "Login" button.
 *  - **Authenticated**: Shows a "Dashboard" link and user avatar dropdown with
 *    account info, navigation links, optional "Admin" entry (for admins), and logout.
 *
 * The avatar dropdown displays the user's name (from Keycloak) or falls back
 * to their email address as the label.
 */
import { getSession } from '@/lib/auth';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LogoutButton } from './logout-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LayoutDashboard, LogOut, User as UserIcon, Mail } from 'lucide-react';
import placeholderData from '@/lib/placeholder-images.json';
const placeholderImages = placeholderData.placeholderImages;

export default async function Header() {
  const session = await getSession();
  const avatarImage = placeholderImages.find(p => p.id === 'avatar_placeholder');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {session ? (
              <div className="flex items-center gap-4">
                <Button variant="ghost" asChild>
                  <Link href="/dashboard">Links</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard/email-manager">Campaigns</Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                       <Avatar className="h-9 w-9">
                         <AvatarImage src={avatarImage?.imageUrl} alt={session.name || session.id} data-ai-hint={avatarImage?.imageHint} />
                         <AvatarFallback>{(session.name || session.id).charAt(0).toUpperCase()}</AvatarFallback>
                       </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session.name || 'My Account'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.id}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                     <DropdownMenuItem asChild>
                        <Link href="/dashboard">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>My Links</span>
                        </Link>
                     </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                        <Link href="/dashboard/email-manager">
                          <Mail className="mr-2 h-4 w-4" />
                          <span>Email Campaigns</span>
                        </Link>
                     </DropdownMenuItem>
                    {session.isAdmin && (
                        <DropdownMenuItem asChild>
                           <Link href="/admin">
                             <UserIcon className="mr-2 h-4 w-4" />
                             <span>Admin</span>
                           </Link>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <LogoutButton />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
