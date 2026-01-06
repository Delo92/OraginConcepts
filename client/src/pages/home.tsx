import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ServiceCard } from "@/components/service-card";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Lightbulb, Palette, Zap } from "lucide-react";
import type { Service, SiteSettings, GalleryItem } from "@shared/schema";

export default function Home() {
  const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const { data: heroItem } = useQuery<GalleryItem | null>({
    queryKey: ["/api/gallery/hero"],
  });

  const heroImage = heroItem?.mediaUrl || "/logo.jpg";
  const isHeroVideo = heroItem?.mediaType === "video";

  const featuredServices = services?.filter(s => s.isActive).slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {isHeroVideo ? (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src={heroImage}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <div
            className="absolute inset-0 bg-contain bg-center bg-no-repeat bg-black"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
        )}
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light mb-6 leading-tight" data-testid="text-hero-title">
              {settings?.businessName || "Oraginal Concepts"}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed font-light" data-testid="text-hero-tagline">
              {settings?.tagline || "Give Me Your Concept, Let's Make It Real."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/book">
                <Button size="lg" className="rounded-full px-8 text-base font-medium" data-testid="button-book-hero">
                  Start Your Project
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/services">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 text-base font-medium"
                  data-testid="button-services-hero"
                >
                  View Services
                </Button>
              </Link>
            </div>
          </div>

          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-normal mb-4" data-testid="text-services-heading">
              Our Services
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From websites to videos, mockups to music — we bring your creative vision to life.
            </p>
          </div>

          {servicesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <Skeleton className="aspect-[4/3] rounded-t-md" />
                  <CardContent className="p-5 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-9 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Services coming soon.</p>
            </div>
          )}

          {featuredServices.length > 0 && (
            <div className="text-center mt-12">
              <Link href="/services">
                <Button variant="outline" className="rounded-full" data-testid="button-view-all-services">
                  View All Services
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 border-0 bg-transparent">
              <CardContent className="p-0">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <Lightbulb className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-medium mb-3">Creative Vision</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We transform your raw ideas into polished, professional creative works that stand out.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 border-0 bg-transparent">
              <CardContent className="p-0">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <Palette className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-medium mb-3">Full-Service Production</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Websites, videos, visual mockups, music — everything you need under one roof.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 border-0 bg-transparent">
              <CardContent className="p-0">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <Zap className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-medium mb-3">Fast Turnaround</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Quality work delivered on time. We respect your deadlines and exceed expectations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-normal mb-4" data-testid="text-about-heading">
            About Oraginal Concepts
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8" data-testid="text-about-content">
            {settings?.aboutText ||
              "At Oraginal Concepts, we believe every idea deserves to be brought to life. Whether you need a stunning website, captivating video content, visual mockups, or custom music production — we're here to turn your concept into reality. Give us your vision, and let's make it happen."}
          </p>
          <Link href="/book">
            <Button size="lg" className="rounded-full px-8" data-testid="button-book-about">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
