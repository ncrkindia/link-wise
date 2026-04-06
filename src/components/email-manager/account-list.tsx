'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EmailAccount } from '@/lib/definitions';
import { deleteEmailAccount } from '@/lib/actions';
import { Plus, Trash2, Edit2, Server, Globe, Mail, MoreVertical } from 'lucide-react';
import { AccountForm } from './account-form';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function AccountList({ accounts }: { accounts: EmailAccount[] }) {
  const [editingAccount, setEditingAccount] = useState<EmailAccount | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleEdit = (acc: EmailAccount) => {
    setEditingAccount(acc);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingAccount(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-headline font-bold">SMTP Accounts</h3>
          <p className="text-sm text-muted-foreground">Manage your outgoing email server credentials.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} className="h-10 font-bold bg-primary shadow-lg shadow-primary/20 transition-all hover:scale-105">
              <Plus className="mr-2 h-4 w-4" /> Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl border-none shadow-2xl">
            <AccountForm account={editingAccount} onComplete={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => (
          <Card key={acc.id} className="group overflow-hidden border-primary/5 hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                   <Server className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                   <CardTitle className="text-sm font-bold font-headline">{acc.provider}</CardTitle>
                   <CardDescription className="text-[10px] tracking-widest uppercase font-bold text-muted-foreground/50">{acc.host}</CardDescription>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(acc)}>
                    <Edit2 className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => deleteEmailAccount(acc.id)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate flex-grow">{acc.username}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Sender Identity</span>
                      <span className="text-[11px] font-bold truncate max-w-[150px]">{acc.senderName || 'User Default'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold">
                   <span className={`px-2 py-0.5 rounded-full ${acc.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {acc.isActive ? 'Connected' : 'Error'}
                   </span>
                   <span className="text-muted-foreground/40">{new Date(acc.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {accounts.length === 0 && (
          <div className="col-span-full py-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground">
             <div className="p-4 bg-secondary rounded-full mb-4">
                <Globe className="h-8 w-8 text-muted-foreground/30" />
             </div>
             <p className="font-bold text-sm">No accounts found.</p>
             <p className="text-xs">Add your first SMTP configuration to start sending.</p>
          </div>
        )}
      </div>
    </div>
  );
}
