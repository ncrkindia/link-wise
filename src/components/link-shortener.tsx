'use client';

import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { shortenLink, type ShortenState } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Copy, Download, KeyRound, Link as LinkIcon, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { placeholderImages } from '@/lib/data';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full md:w-auto" disabled={pending}>
      {pending ? 'Shortening...' : 'Shorten Link'}
      <LinkIcon className="ml-2 h-4 w-4" />
    </Button>
  );
}

export function LinkShortener() {
  const initialState: ShortenState = { message: null, errors: {} };
  const [state, dispatch] = useActionState(shortenLink, initialState);
  const [date, setDate] = useState<Date | undefined>();
  const { toast } = useToast();
  const qrImage = placeholderImages.find(p => p.id === 'qr_code_placeholder');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
      description: text,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <form action={dispatch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-2">
              <Input
                id="url"
                name="url"
                type="url"
                placeholder="https://your-long-url.com/goes/here"
                className="flex-grow"
                required
                aria-describedby="url-error"
              />
              <SubmitButton />
            </div>
             {state.errors?.url && (
                <div id="url-error" aria-live="polite" className="text-sm text-destructive">
                    {state.errors.url.map((error: string) => <p key={error}>{error}</p>)}
                </div>
            )}
            
            <Accordion type="single" collapsible>
              <AccordionItem value="advanced" className="border-b-0">
                <AccordionTrigger className="text-sm hover:no-underline">
                  Advanced Options
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Password (optional)"
                      className="pl-9"
                    />
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'PPP') : <span>Expiration date (optional)</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                       <input type="hidden" name="expiresAt" value={date?.toISOString()} />
                    </PopoverContent>
                  </Popover>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </form>
        </CardContent>
      </Card>

      {state.shortUrl && (
        <Card className="bg-secondary shadow-inner animate-in fade-in-50 slide-in-from-bottom-5">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Your Link is Ready!</CardTitle>
            <CardDescription>
                Original: <span className="truncate">{state.originalUrl}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                 <div className="flex-grow w-full p-4 bg-background rounded-md flex items-center justify-between">
                    <a href={state.shortUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-primary text-lg hover:underline truncate">
                        {state.shortUrl.replace(/^https?:\/\//, '')}
                    </a>
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(state.shortUrl!)}>
                        <Copy className="h-5 w-5" />
                    </Button>
                </div>
                <div className="flex-shrink-0 flex gap-2">
                    <Button variant="outline" size="icon">
                        <Download className="h-5 w-5" />
                         <span className="sr-only">Download QR Code</span>
                    </Button>
                </div>
            </div>
            {qrImage && 
              <div className="text-center p-4 bg-background rounded-lg">
                <Image 
                  src={qrImage.imageUrl} 
                  alt="QR Code" 
                  width={160} 
                  height={160} 
                  className="mx-auto rounded-md"
                  data-ai-hint={qrImage.imageHint}
                />
              </div>
            }
          </CardContent>
        </Card>
      )}
    </div>
  );
}
