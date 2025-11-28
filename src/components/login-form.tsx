'use client';
import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { login } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail } from 'lucide-react';

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Signing In...' : 'Sign In'}
    </Button>
  );
}

export function LoginForm() {
  const [state, dispatch] = useActionState(login, { message: '' });

  return (
    <form action={dispatch} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="admin@linkwise.com"
            required
            className="pl-9"
          />
        </div>
      </div>
      <LoginButton />
      {state.message && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
       <p className="px-8 text-center text-sm text-muted-foreground">
        Use <code className="font-mono bg-muted p-1 rounded-sm">admin@linkwise.com</code> or <code className="font-mono bg-muted p-1 rounded-sm">user1@example.com</code> to login.
      </p>
    </form>
  );
}
