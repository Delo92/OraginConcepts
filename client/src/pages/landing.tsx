import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <span className="font-serif text-2xl font-medium tracking-tight text-white">
              Oraginal Concepts
            </span>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <a href="/api/login">
                <Button variant="outline" className="rounded-full bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20" data-testid="button-login">
                  Owner Login
                </Button>
              </a>
            </div>
          </div>
        </nav>
      </header>

      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(/logo.jpg)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-8">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-white/90 text-sm">Creative Media Development</span>
          </div>
          
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light text-white mb-6 leading-tight" data-testid="text-landing-title">
            Oraginal Concepts
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            Give Me Your Concept, Let's Make It Real. Websites, videos, mockups, music — we bring your ideas to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book">
              <Button size="lg" className="rounded-full px-8 text-base font-medium" data-testid="button-book-landing">
                Start Your Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/services">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 text-base font-medium bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20"
                data-testid="button-services-landing"
              >
                View Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
