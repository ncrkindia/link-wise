'use client';

import { useActionState, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { bulkShortenLinks, type BulkShortenState } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileUp, Link as LinkIcon, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'Processing...' : 'Bulk Shorten'}
      <LinkIcon className="ml-2 h-4 w-4" />
    </Button>
  );
}

export function BulkShortener() {
  const [state, dispatch] = useActionState(bulkShortenLinks, { message: '', errors: [], results: [] });
  const [urls, setUrls] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        const existing = urls ? urls + '\n' : '';
        setUrls(existing + text);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadCsv = () => {
    if (!state.results || state.results.length === 0) return;
    
    const header = "Original URL,Short URL\n";
    const csvContent = state.results.map(r => `"${r.originalUrl}","${r.shortUrl}"`).join("\n");
    const blob = new Blob([header + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "bulk_links.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!', description: text });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Shorten URLs</CardTitle>
          <CardDescription>Paste multiple URLs (one per line) or upload a .txt/.csv file.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={dispatch} className="space-y-4">
            <div className="space-y-2">
              <textarea 
                name="urls" 
                value={urls} 
                onChange={(e) => setUrls(e.target.value)} 
                placeholder="https://example.com&#10;https://anotherexample.com" 
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[150px] font-mono"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input 
                  type="file" 
                  accept=".txt,.csv" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto"
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              </div>
              <SubmitButton />
            </div>

            {state.errors && state.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>{state.errors[0]}</AlertDescription>
              </Alert>
            )}
            {state.message && state.results && state.results.length > 0 && (
               <Alert>
                 <AlertDescription className="text-primary font-medium">{state.message}</AlertDescription>
               </Alert>
            )}
          </form>
        </CardContent>
      </Card>

      {state.results && state.results.length > 0 && (
        <Card className="animate-in fade-in-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1 mt-4">
              <CardTitle>Generated Links</CardTitle>
              <CardDescription>Successfully processed {state.results.length} links.</CardDescription>
            </div>
            <Button onClick={handleDownloadCsv} variant="secondary" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border max-h-[400px] overflow-auto mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Original URL</TableHead>
                    <TableHead>Short URL</TableHead>
                    <TableHead className="w-[100px] text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.results.map((result, i) => (
                    <TableRow key={i}>
                      <TableCell className="max-w-[200px] truncate" title={result.originalUrl}>
                        {result.originalUrl}
                      </TableCell>
                      <TableCell>
                        <a href={result.shortUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                          {result.shortUrl.replace(/^https?:\/\//, '')}
                        </a>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleCopy(result.shortUrl)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
