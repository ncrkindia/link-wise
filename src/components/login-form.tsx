'use client';

import { login } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';
import { useFormStatus } from 'react-dom';

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      <KeyRound className="mr-2 h-4 w-4" />
      {pending ? 'Routing to Keycloak...' : 'Sign in with Keycloak'}
    </Button>
  );
}

export function LoginForm() {
  return (
    <form action={login} className="space-y-4">
      <div className="space-y-2 text-center text-sm text-muted-foreground pb-4">
        Click below to authenticate using your organization's secure portal.
      </div>
      <LoginButton />
    </form>
  );
}
