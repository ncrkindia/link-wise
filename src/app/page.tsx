import Image from 'next/image';
import { LinkShortener } from '@/components/link-shortener';
import placeholderData from '@/lib/placeholder-images.json';
const placeholderImages = placeholderData.placeholderImages;
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, BarChart, ShieldCheck, Activity, Mail } from 'lucide-react';

import { getSession } from '@/lib/auth';

export default async function Home() {
  const session = await getSession();
  const heroImage = placeholderImages.find(p => p.id === 'hero');

  return (
    <div className="w-full">
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tighter">
              Smart Links, <br />
              <span className="text-primary">Stealth Campaigns</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0">
              Transform long URLs into memorable links and launch tracked email campaigns with stealth pixels.
              Monitor every click and open from one unified intelligence dashboard.
            </p>
            <div className="max-w-xl mx-auto md:mx-0">
               <LinkShortener user={session} />
            </div>
          </div>
          <div className="relative h-64 md:h-auto md:aspect-square flex items-center justify-center">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover rounded-xl shadow-lg border-2 border-primary/5"
                data-ai-hint={heroImage.imageHint}
              />
            )}
          </div>
        </div>
      </section>

      <section className="bg-secondary/50 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Unified Data Intelligence</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Link-Wise is now a complete ecosystem for URL management and stealth email marketing.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-sm hover:shadow-xl transition-all duration-300 border-primary/5">
              <CardContent className="p-8">
                <div className="p-3 bg-primary/10 rounded-xl inline-block mb-4">
                  <BarChart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-headline font-bold mb-2">Advanced Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Deeply analyze your link performance and campaign batches with high-fidelity charts and reports.
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm hover:shadow-xl transition-all duration-300 border-primary/5">
              <CardContent className="p-8">
                <div className="p-3 bg-primary/10 rounded-xl inline-block mb-4">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-headline font-bold mb-2">Link Protection</h3>
                <p className="text-sm text-muted-foreground">
                  Secure your short links with passwords and set time-sensitive expiration for ultimate control.
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm hover:shadow-xl transition-all duration-300 border-primary/5">
              <CardContent className="p-8">
                <div className="p-3 bg-primary/10 rounded-xl inline-block mb-4">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-headline font-bold mb-2">Stealth Pixels</h3>
                <p className="text-sm text-muted-foreground">
                  Zero-footprint 1x1 tracking pixels for your email campaigns. monitor opens without recipient friction.
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm hover:shadow-xl transition-all duration-300 border-primary/5">
              <CardContent className="p-8">
                <div className="p-3 bg-primary/10 rounded-xl inline-block mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-headline font-bold mb-2">Campaign Manager</h3>
                <p className="text-sm text-muted-foreground">
                  Launch mass-email tracking campaigns with ease using personalized templates and SMTP relays.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
