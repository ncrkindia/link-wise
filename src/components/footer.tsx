/**
 * @file components/footer.tsx
 * @description Global site footer rendered on all public-facing pages.
 *
 * Displays:
 *  - Left: The Link-Wise logo and "Part of the SL Pro Ecosystem" tagline.
 *  - Right: Support email link and copyright notice.
 *
 * This is a Server Component with no interactivity or client-side state.
 */
import { Logo } from "./logo";

import { Mail } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t bg-secondary">
            <div className="container mx-auto px-4 md:px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
                <div className="flex flex-col items-center sm:items-start space-y-2">
                    <Logo />
                    <p className="text-sm text-primary font-medium tracking-wide">Part of the SL Pro Ecosystem</p>
                </div>

                <div className="flex flex-col items-center sm:items-end space-y-2 text-sm text-muted-foreground">
                    <a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`} className="flex items-center gap-2 hover:text-foreground transition-colors duration-200">
                        <Mail className="h-4 w-4" />
                        {process.env.NEXT_PUBLIC_SUPPORT_EMAIL}
                    </a>
                    <p>
                        © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_APP_NAME}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
