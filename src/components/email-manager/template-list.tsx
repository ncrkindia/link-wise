'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EmailTemplate } from '@/lib/definitions';
import { deleteEmailTemplate } from '@/lib/actions';
import { Plus, Trash2, Edit2, FileText, Layout, Mail, MoreVertical } from 'lucide-react';
import { TemplateEditor } from './template-editor';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function TemplateList({ templates }: { templates: EmailTemplate[] }) {
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleEdit = (tmpl: EmailTemplate) => {
    setEditingTemplate(tmpl);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingTemplate(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-headline font-bold">Email Templates</h3>
          <p className="text-sm text-muted-foreground">Draft and store the content for your email campaigns.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} className="h-10 font-bold bg-primary shadow-lg shadow-primary/20 transition-all hover:scale-105">
              <Plus className="mr-2 h-4 w-4" /> New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl border-none shadow-2xl">
            <TemplateEditor template={editingTemplate} onComplete={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tmpl) => (
          <Card key={tmpl.id} className="group overflow-hidden border-primary/5 hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                   <FileText className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                   <CardTitle className="text-sm font-bold font-headline truncate max-w-[120px]">{tmpl.name}</CardTitle>
                   <CardDescription className="text-[10px] tracking-widest uppercase font-bold text-muted-foreground/50">Template</CardDescription>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(tmpl)}>
                    <Edit2 className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => deleteEmailTemplate(tmpl.id)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-muted/30 p-2 rounded-md">
                   <Layout className="h-3.5 w-3.5 text-primary" />
                   <span className="truncate flex-grow">{tmpl.subject}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold">
                   <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {tmpl.htmlContent ? 'HTML' : 'Plaintext'}
                   </span>
                   <span className="text-muted-foreground/40">{new Date(tmpl.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {templates.length === 0 && (
          <div className="col-span-full py-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground">
             <div className="p-4 bg-secondary rounded-full mb-4">
                <Mail className="h-8 w-8 text-muted-foreground/30" />
             </div>
             <p className="font-bold text-sm">No templates found.</p>
             <p className="text-xs">Create your first template to use in campaigns.</p>
          </div>
        )}
      </div>
    </div>
  );
}
