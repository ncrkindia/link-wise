'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { unlockLink } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound, ShieldCheck } from 'lucide-react';

function UnlockButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Verifying...' : 'Unlock Link'}
    </Button>
  );
}

export function UnlockForm({ id }: { id: string }) {
  const [state, dispatch] = useActionState(unlockLink, { message: '' });

  return (
    <Card className="w-full max-w-sm mx-auto shadow-lg">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto bg-primary/10 p-4 rounded-full inline-block">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-headline">Protected Link</CardTitle>
        <CardDescription>This link requires a password to view.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={dispatch} className="space-y-4">
          <input type="hidden" name="id" value={id} />
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password..."
                required
                className="pl-9"
              />
            </div>
          </div>
          
          <UnlockButton />
          
          {state.message && (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
