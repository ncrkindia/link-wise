'use client';
import { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { saveEmailAccount } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { EmailAccount } from '@/lib/definitions';
import { ShieldCheck, Mail, Server, Loader2 } from 'lucide-react';

const PRESETS = {
  GMAIL: { host: 'smtp.gmail.com', port: 587 },
  OUTLOOK: { host: 'smtp-mail.outlook.com', port: 587 },
  YAHOO: { host: 'smtp.mail.yahoo.com', port: 587 },
  CUSTOM: { host: '', port: 587 }
};

export function AccountForm({ account, onComplete }: { account?: EmailAccount, onComplete: () => void }) {
  const [state, action] = useFormState(saveEmailAccount, { message: '', success: false });
  const { toast } = useToast();
  const [provider, setProvider] = useState<string>(account?.provider || 'CUSTOM');
  const [host, setHost] = useState(account?.host || '');
  const [port, setPort] = useState(account?.port || 587);

  useEffect(() => {
    if (state.success) {
      toast({ title: 'Success', description: state.message });
      onComplete();
    } else if (state.message) {
      toast({ title: 'Error', description: state.message, variant: 'destructive' });
    }
  }, [state, toast, onComplete]);

  const handleProviderChange = (val: string) => {
    setProvider(val);
    if (val !== 'CUSTOM') {
      const preset = PRESETS[val as keyof typeof PRESETS];
      setHost(preset.host);
      setPort(preset.port);
    }
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl flex items-center gap-2 font-headline">
          <Server className="h-5 w-5 text-primary" />
          {account ? 'Edit SMTP Account' : 'Add New SMTP Account'}
        </CardTitle>
        <CardDescription>
          Configure your email server settings to send campaigns directly from Link-Wise.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <form action={action} className="space-y-6">
          <input type="hidden" name="id" value={account?.id || ''} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="provider">Email Provider</Label>
              <Select name="provider" value={provider} onValueChange={handleProviderChange}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GMAIL">Google / Gmail</SelectItem>
                  <SelectItem value="OUTLOOK">Outlook / Office 365</SelectItem>
                  <SelectItem value="YAHOO">Yahoo Mail</SelectItem>
                  <SelectItem value="CUSTOM">Custom SMTP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="host">SMTP Host</Label>
              <Input 
                id="host" 
                name="host" 
                value={host} 
                onChange={(e) => setHost(e.target.value)}
                placeholder="smtp.example.com" 
                required 
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input 
                id="port" 
                name="port" 
                type="number" 
                value={port} 
                onChange={(e) => setPort(parseInt(e.target.value))}
                placeholder="587" 
                required 
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username / Email</Label>
              <Input 
                id="username" 
                name="username" 
                defaultValue={account?.username} 
                placeholder="user@example.com" 
                required 
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senderName">Sender Display Name (Optional)</Label>
              <Input 
                id="senderName" 
                name="senderName" 
                defaultValue={account?.senderName} 
                placeholder="e.g. Naveen Chauhan" 
                className="h-11"
              />
              <p className="text-[10px] text-muted-foreground pl-1">
                Identity that recipients will see (e.g. "Marketing Dept").
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="password">
                {account ? 'New Password (leave blank to keep current)' : 'Password / App Password'}
              </Label>
              <div className="relative">
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required={!account} 
                  className="h-11 pr-10"
                />
                <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                For Gmail/Outlook, please use an <b>App Password</b> instead of your main account password.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onComplete}>Cancel</Button>
            <Button type="submit" className="h-11 px-8 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
              <Mail className="mr-2 h-4 w-4" />
              Save SMTP Configuration
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
