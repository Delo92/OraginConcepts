import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { Link } from "wouter";
import type { Service } from "@shared/schema";

interface ServiceCardProps {
  service: Service;
  showBookButton?: boolean;
}

export function ServiceCard({ service, showBookButton = true }: ServiceCardProps) {
  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  return (
    <Card className="overflow-visible group" data-testid={`card-service-${service.id}`}>
      <div className="aspect-[4/3] overflow-hidden rounded-t-md">
        {service.imageUrl ? (
          <img
            src={service.imageUrl}
            alt={service.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-sm">No image</span>
          </div>
        )}
      </div>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3 flex-wrap">
          <h3 className="font-serif text-xl font-medium" data-testid={`text-service-name-${service.id}`}>
            {service.name}
          </h3>
          <Badge variant="secondary" className="shrink-0">
            {formatPrice(service.price)}
          </Badge>
        </div>
        
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3" data-testid={`text-service-description-${service.id}`}>
          {service.description}
        </p>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(service.duration)}</span>
          </div>

          {showBookButton && (
            <Link href={`/book?service=${service.id}`}>
              <Button size="sm" data-testid={`button-book-service-${service.id}`}>
                Get Started
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
