"use client";

import { useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { Card, CardHeader, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { Loader2 } from "lucide-react";

export function AutoSignIn() {
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      signIn("keycloak", { callbackUrl: "/" });
    }
  }, []);

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-12">
      <Card className="w-full max-w-sm mx-auto shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="inline-block"><Logo /></div>
          <CardDescription className="text-base font-medium flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecting to Secure Login...
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
