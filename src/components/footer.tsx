import { Logo } from "./logo";

export default function Footer() {
    return (
        <footer className="border-t bg-secondary">
            <div className="container mx-auto px-4 md:px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <Logo />
                <p className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} LinkWise. All rights reserved.
                </p>
            </div>
        </footer>
    )
}
