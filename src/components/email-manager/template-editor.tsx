'use client';
import { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { saveEmailTemplate } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { EmailTemplate } from '@/lib/definitions';
import { FileEdit, Layout, Code2, Eye, Save } from 'lucide-react';

export function TemplateEditor({ template, onComplete }: { template?: EmailTemplate, onComplete: () => void }) {
  const [state, action] = useFormState(saveEmailTemplate, { message: '', success: false });
  const { toast } = useToast();
  const [htmlContent, setHtmlContent] = useState(template?.htmlContent || '');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (state.success) {
      toast({ title: 'Success', description: state.message });
      onComplete();
    } else if (state.message) {
      toast({ title: 'Error', description: state.message, variant: 'destructive' });
    }
  }, [state, toast, onComplete]);

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl flex items-center gap-2 font-headline">
          <FileEdit className="h-5 w-5 text-primary" />
          {template ? 'Edit Template' : 'Create New Template'}
        </CardTitle>
        <CardDescription>
          Design your campaign message. You can use standard HTML for rich layouts.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <form action={action} className="space-y-6">
          <input type="hidden" name="id" value={template?.id || ''} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={template?.name} 
                placeholder="Newsletter April 2026" 
                required 
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input 
                id="subject" 
                name="subject" 
                defaultValue={template?.subject} 
                placeholder="Important update from Link-Wise!" 
                required 
                className="h-11"
              />
            </div>
          </div>

          <Tabs defaultValue="html" className="w-full">
            <div className="flex items-center justify-between mb-2">
              <TabsList className="grid w-[300px] grid-cols-2">
                <TabsTrigger value="html" className="flex items-center gap-2">
                  <Layout className="h-3.5 w-3.5" /> HTML Content
                </TabsTrigger>
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <Code2 className="h-3.5 w-3.5" /> Plaintext
                </TabsTrigger>
              </TabsList>
              
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setPreviewMode(!previewMode)}
                className="h-8 text-xs font-bold"
              >
                {previewMode ? <FileEdit className="mr-1 h-3.5 w-3.5" /> : <Eye className="mr-1 h-3.5 w-3.5" />}
                {previewMode ? 'Back to Editor' : 'Live Preview'}
              </Button>
            </div>

            <TabsContent value="html" className="mt-0">
              {previewMode ? (
                <div className="border rounded-md p-4 bg-white min-h-[300px] prose prose-sm max-w-none prose-slate">
                   <div dangerouslySetInnerHTML={{ __html: htmlContent || '<p class="text-muted-foreground italic text-center py-12">No content to preview.</p>' }} />
                   <div className="mt-8 pt-4 border-t text-[10px] text-muted-foreground text-center">
                      [Email Tracking Pixel will be auto-inserted here]
                   </div>
                </div>
              ) : (
                <Textarea 
                  id="htmlContent" 
                  name="htmlContent" 
                  value={htmlContent}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setHtmlContent(e.target.value)}
                  placeholder="<h1>Hello!</h1> <p>This is your monthly update...</p>" 
                  className="min-h-[300px] font-mono text-sm p-4 leading-relaxed"
                />
              )}
            </TabsContent>
            
            <TabsContent value="text" className="mt-0">
              <Textarea 
                id="textContent" 
                name="textContent" 
                defaultValue={template?.textContent || ''}
                placeholder="Hello! This is your monthly update..." 
                className="min-h-[300px] font-sans text-sm p-4 leading-relaxed"
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onComplete}>Cancel</Button>
            <Button type="submit" className="h-11 px-8 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
              <Save className="mr-2 h-4 w-4" />
              Save Template
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
