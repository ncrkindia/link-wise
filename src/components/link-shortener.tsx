'use client';

import { useFormStatus } from 'react-dom';
import { useActionState, useState } from 'react';
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
import { Calendar as CalendarIcon, Copy, Download, KeyRound, Link as LinkIcon, QrCode, Share2, Mail, Info, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import placeholderData from '@/lib/placeholder-images.json';

const placeholderImages = placeholderData.placeholderImages;

import { User } from '@/lib/definitions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full md:w-auto" disabled={pending}>
      {pending ? 'Shortening...' : 'Shorten Link'}
      <LinkIcon className="ml-2 h-4 w-4" />
    </Button>
  );
}

export function LinkShortener({ user }: { user?: User | null }) {
  const initialState: ShortenState = { message: null, errors: {} };
  const [state, dispatch] = useActionState(shortenLink, initialState);
  const [date, setDate] = useState<Date | undefined>();
  const [isPixel, setIsPixel] = useState(false);
  const { toast } = useToast();
  const qrImage = placeholderImages.find(p => p.id === 'qr_code_placeholder');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
      description: text,
    });
  };

  const handleShare = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Link-Wise Short URL',
          text: 'Check out this link!',
          url: url,
        });
      } catch (error) {
        console.error('Share failed', error);
      }
    } else {
      handleCopy(url);
    }
  };

  const pixelHtml = state.shortUrl ? `<img src="${state.shortUrl}" alt="" width="1" height="1" style="display:none;opacity:0;" />` : '';

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-primary/10">
        <CardContent className="p-6">
          <form action={dispatch} className="space-y-4">
            {user && (
              <div className="flex items-center justify-between mb-4 bg-muted/30 p-3 rounded-lg border border-primary/5">
                <div className="flex items-center space-x-3">
                  <Switch 
                    id="pixel-mode" 
                    checked={isPixel} 
                    onCheckedChange={setIsPixel}
                  />
                  <Label htmlFor="pixel-mode" className="font-semibold flex items-center gap-2 cursor-pointer text-sm">
                    {isPixel ? <Mail className="h-4 w-4 text-primary" /> : <LinkIcon className="h-4 w-4 text-primary" />}
                    {isPixel ? 'Email Tracking Pixel' : 'Convert to Email Pixel'}
                  </Label>
                </div>
                {isPixel && (
                  <div className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Invisible Tracker
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-2">
              <Input
                id="url"
                name="url"
                type="text"
                placeholder={isPixel ? "Reference Name (e.g. Newsletter April)" : "https://your-long-url.com/goes/here"}
                className="flex-grow h-12 text-base transition-all duration-200"
                required
                aria-describedby="url-error"
              />
              <input type="hidden" name="isPixel" value={isPixel.toString()} />
              <SubmitButton />
            </div>

            {isPixel && (
               <p className="text-xs text-muted-foreground flex items-center gap-1.5 px-1 bg-primary/5 p-2 rounded-lg border border-primary/10">
                 <Info className="h-3.5 w-3.5 text-primary" />
                 <span>Enter a unique <b>Reference Name</b> or <b>Campaign ID</b>. This will not be visible to recipients but helps you track opens.</span>
               </p>
            )}

             {state.errors?.url && (
                <div id="url-error" aria-live="polite" className="text-sm text-destructive">
                    {state.errors.url.map((error: string) => <p key={error}>{error}</p>)}
                </div>
            )}
            
            <Accordion type="single" collapsible>
              <AccordionItem value="advanced" className="border-b-0">
                <AccordionTrigger className="text-sm hover:no-underline opacity-70 hover:opacity-100 transition-opacity">
                  Advanced Options
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  {!isPixel && (
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
                  )}
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
                    </PopoverContent>
                    <input type="hidden" name="expiresAt" value={date ? date.toISOString() : ''} />
                  </Popover>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </form>
        </CardContent>
      </Card>

      {state.shortUrl && (
        <Card className="bg-secondary/30 border-primary/10 shadow-inner animate-in fade-in-50 slide-in-from-bottom-5 overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-headline flex items-center gap-2">
              {isPixel ? <ShieldCheck className="h-6 w-6 text-primary" /> : <QrCode className="h-6 w-6 text-primary" />}
              {isPixel ? 'Tracker Ready!' : 'Your Link is Ready!'}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
                <span className="font-semibold text-primary/70">{isPixel ? 'Reference:' : 'Original:'}</span>
                <span className="truncate">{state.originalUrl}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-5">
                 <div className="w-full p-4 bg-background/50 rounded-xl border border-primary/20 flex items-center justify-between group shadow-sm">
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1 tracking-wider">{isPixel ? 'Pixel URL' : 'Short URL'}</span>
                      <a href={state.shortUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-primary text-xl hover:underline truncate">
                          {state.shortUrl.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleCopy(state.shortUrl!)} className="hover:bg-primary/10 text-primary">
                          <Copy className="h-5 w-5" />
                      </Button>
                      {!isPixel && (
                        <Button variant="ghost" size="icon" onClick={() => handleShare(state.shortUrl!)} className="hover:bg-primary/10 text-primary">
                            <Share2 className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                </div>

                {isPixel && (
                  <div className="space-y-3 animate-in fade-in duration-500">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">HTML Embedding Snippet</Label>
                    <div className="relative group">
                      <pre className="p-5 bg-slate-950 text-slate-50 rounded-xl text-xs overflow-x-auto border border-white/10 font-mono leading-relaxed shadow-xl pr-28">
                        {pixelHtml}
                      </pre>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="absolute right-3 top-3 h-8 shadow-sm hover:bg-white hover:text-black transition-colors"
                        onClick={() => handleCopy(pixelHtml)}
                      >
                        <Copy className="mr-2 h-3.5 w-3.5" />
                        Copy Code
                      </Button>
                    </div>
                    <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                      <p className="text-[11px] text-muted-foreground flex gap-2">
                        <Info className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary" />
                        <span>Paste this code in your email HTML. It's an invisible 1x1 image that tracks openings.</span>
                      </p>
                    </div>
                  </div>
                )}
            </div>
            
            {!isPixel && qrImage && (
              <div className="text-center p-6 bg-background/50 rounded-xl border border-dashed border-primary/20 relative group">
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/40 backdrop-blur-[1px] rounded-xl">
                   <Button variant="secondary" size="sm" className="shadow-lg">
                      <Download className="mr-2 h-4 w-4" /> Download QR
                   </Button>
                </div>
                <Image 
                  src={qrImage.imageUrl} 
                  alt="QR Code" 
                  width={180} 
                  height={180} 
                  className="mx-auto rounded-lg shadow-md grayscale-[0.2] group-hover:grayscale-0 transition-all"
                  data-ai-hint={qrImage.imageHint}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
