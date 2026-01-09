import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ServiceCard } from "@/components/service-card";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Sun, Moon } from "lucide-react";
import type { Service } from "@shared/schema";

type FilterMode = "all" | "yin" | "yang";

export default function Services() {
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const filteredServices = useMemo(() => {
    if (!services) return [];
    const activeServices = services.filter((s) => s.isActive);
    if (filterMode === "all") return activeServices;
    if (filterMode === "yin") {
      return activeServices.filter(
        (s) => s.displayMode === "professional" || s.displayMode === "both"
      );
    }
    return activeServices.filter(
      (s) => s.displayMode === "edge" || s.displayMode === "both"
    );
  }, [services, filterMode]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-24 pb-12 px-4 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-4" data-testid="text-services-page-title">
            Our Services
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg mb-6">
            Explore our range of creative services designed to bring your ideas to life.
          </p>
          
          {/* Yin/Yang Filter Buttons */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant={filterMode === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterMode("all")}
              className="rounded-full px-4"
            >
              All Services
            </Button>
            <Button
              variant={filterMode === "yin" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterMode("yin")}
              className="rounded-full px-4 gap-2"
            >
              <Sun className="h-4 w-4" />
              Yin
            </Button>
            <Button
              variant={filterMode === "yang" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterMode("yang")}
              className="rounded-full px-4 gap-2"
            >
              <Moon className="h-4 w-4" />
              Yang
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <Skeleton className="aspect-[4/3] rounded-t-md" />
                  <CardContent className="p-6 space-y-3">
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <div className="flex justify-between pt-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-9 w-28" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg mb-4">No services available at this time.</p>
              <p className="text-muted-foreground text-sm">Please check back soon!</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4 bg-card">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl font-normal mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8">
            Choose your preferred service and let's bring your concept to life. Your creative journey starts here.
          </p>
          <Link href="/book">
            <Button size="lg" className="btn-metallic rounded-full px-8" data-testid="button-book-services-page">
              Start Your Project
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
