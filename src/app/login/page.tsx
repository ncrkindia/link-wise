/**
 * @file app/login/page.tsx
 * @description Server-side login entry point for the Link-Wise application.
 *
 * This Server Component performs a health-check against the Keycloak OIDC
 * discovery endpoint before triggering the authentication flow:
 *
 *  1. If `AUTH_KEYCLOAK_ISSUER` is not set → shows a configuration error card.
 *  2. If Keycloak is unreachable (network/timeout error) → shows an "offline" error card.
 *  3. If Keycloak is healthy → renders <AutoSignIn> which immediately triggers the
 *     client-side Keycloak redirect (cookies cannot be set during server-side render).
 *
 * Route: `/login`
 */
import { AutoSignIn } from "./auto-sign-in";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Logo } from "@/components/logo";

export default async function LoginPage() {
  const issuer = process.env.AUTH_KEYCLOAK_ISSUER;
  
  if (!issuer) {
    return (
      <div className="container flex min-h-[80vh] items-center justify-center py-12">
        <Card className="w-full max-w-sm mx-auto shadow-lg border-destructive/50">
          <CardHeader className="text-center space-y-2">
            <div className="inline-block"><Logo /></div>
            <CardTitle className="text-xl font-headline text-destructive flex items-center justify-center gap-2">
              <AlertCircle className="h-5 w-5" /> Configuration Error
            </CardTitle>
            <CardDescription>Keycloak issuer URL is missing from environment variables.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  try {
    // Ping Keycloak OpenID configuration to check if server is up
    const res = await fetch(`${issuer}/.well-known/openid-configuration`, {
      method: "GET",
      // Force a fast timeout so users don't hang if Keycloak is fully offline
      signal: AbortSignal.timeout ? AbortSignal.timeout(3000) : undefined, 
    });

    if (!res.ok) {
      throw new Error("Auth Server Offline");
    }
  } catch (error) {
    // Server is down or unreachable
    return (
      <div className="container flex min-h-[80vh] items-center justify-center py-12">
        <Card className="w-full max-w-sm mx-auto shadow-lg border-destructive/50">
          <CardHeader className="text-center space-y-4">
            <div className="inline-block"><Logo /></div>
            <CardDescription className="text-base text-destructive font-medium">
              error connect Auth Server , try againg later.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // If the server map is healthy, instantly trigger NextAuth Keycloak flow to bypass this page
  return <AutoSignIn />;
}
