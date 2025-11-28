import Image from 'next/image';
import { LinkShortener } from '@/components/link-shortener';
import { placeholderImages } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, BarChart, ShieldCheck } from 'lucide-react';

export default function Home() {
  const heroImage = placeholderImages.find(p => p.id === 'hero');

  return (
    <div className="w-full">
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tighter">
              Shorter Links, <br />
              <span className="text-primary">Wiser Connections</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0">
              Transform your long, cumbersome URLs into short, memorable links.
              Track every click, protect your links, and build a smarter brand presence with LinkWise.
            </p>
            <div className="max-w-xl mx-auto md:mx-0">
               <LinkShortener />
            </div>
          </div>
          <div className="relative h-64 md:h-auto md:aspect-square flex items-center justify-center">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover rounded-xl shadow-lg"
                data-ai-hint={heroImage.imageHint}
              />
            )}
          </div>
        </div>
      </section>

      <section className="bg-secondary py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Powerful Features for Everyone</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Whether you're sharing a link for the first time or managing a global campaign, LinkWise has the tools you need.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="p-4 bg-primary/10 rounded-full inline-block mb-4">
                  <BarChart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-headline font-semibold mb-2">Detailed Analytics</h3>
                <p className="text-muted-foreground">
                  Understand your audience with detailed click tracking, geographic data, and referral information.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="p-4 bg-primary/10 rounded-full inline-block mb-4">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-headline font-semibold mb-2">Link Protection</h3>
                <p className="text-muted-foreground">
                  Secure your links with password protection and set expiration dates for time-sensitive content.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="p-4 bg-primary/10 rounded-full inline-block mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-headline font-semibold mb-2">Easy Management</h3>
                <p className="text-muted-foreground">
                  An intuitive dashboard for registered users to manage, edit, and organize all their shortened links.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
