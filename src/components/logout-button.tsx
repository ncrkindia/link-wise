'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { handleSignOut } from '@/lib/actions';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

/**
 * LogoutButton (Client Component)
 *
 * This component handles the full OIDC logout flow:
 * 1. It fetches the Keycloak logout URL from the server.
 * 2. It clears the local Auth.js session using signOut({ redirect: false }).
 * 3. It performs a hard redirect to the Keycloak end-session endpoint.
 */
export function LogoutButton() {
  const handleLogout = async () => {
    try {
      // 1. Get the Keycloak logout URL from the server action
      const logoutUrl = await handleSignOut();

      // 2. Clear the local Auth.js session (cookies)
      // redirect: false prevents the standard NextAuth redirect so we can do our own.
      await signOut({ redirect: false });

      // 3. Perform a full redirect to Keycloak to terminate the SSO session
      window.location.href = logoutUrl;
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback: simple reload or home redirect if everything fails
      window.location.href = '/';
    }
  };

  return (
    <DropdownMenuItem
      onSelect={(e) => {
        // Prevent the dropdown from closing immediately which might interrupt the async flow
        e.preventDefault();
        handleLogout();
      }}
      className="cursor-pointer"
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>Log out</span>
    </DropdownMenuItem>
  );
}
