import { Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline group">
      <div className="p-2 bg-primary/20 text-primary rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <LinkIcon className="h-5 w-5" />
      </div>
      <span>LinkWise</span>
    </Link>
  );
}
