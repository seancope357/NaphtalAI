import Link from "next/link";
import { Button } from "@/components/ui/button";

import { ModeToggle } from "@/components/mode-toggle";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-background/80 backdrop-blur-sm">
      <div className="container flex items-center justify-between mx-auto">
        <Link href="/" className="text-xl font-bold">
          NaphtalAI
        </Link>
        <nav className="hidden space-x-4 md:flex">
          <Link href="#features" className="text-muted-foreground hover:text-foreground">
            Features
          </Link>
          <Link href="#testimonials" className="text-muted-foreground hover:text-foreground">
            Testimonials
          </Link>
          <Link href="#pricing" className="text-muted-foreground hover:text-foreground">
            Pricing
          </Link>
          <Link href="#faq" className="text-muted-foreground hover:text-foreground">
            FAQ
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
