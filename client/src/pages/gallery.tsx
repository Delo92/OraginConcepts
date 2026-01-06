import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Heart, ExternalLink, X } from "lucide-react";
import { useState } from "react";
import type { GalleryItem, SiteSettings } from "@shared/schema";

export default function Gallery() {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [showTipDialog, setShowTipDialog] = useState(false);

  const { data: galleryItems, isLoading } = useQuery<GalleryItem[]>({
    queryKey: ["/api/gallery"],
  });

  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const getPaymentLinks = () => {
    const links = [];
    if (settings?.cashappLink) links.push({ name: "Cash App", url: settings.cashappLink });
    if (settings?.venmoLink) links.push({ name: "Venmo", url: settings.venmoLink });
    if (settings?.chimeLink) links.push({ name: "Chime", url: settings.chimeLink });
    if (settings?.applepayLink) links.push({ name: "Apple Pay", url: settings.applepayLink });
    return links;
  };

  const renderMedia = (item: GalleryItem, isModal = false) => {
    if (item.mediaType === "video") {
      return (
        <video
          src={item.mediaUrl}
          className={isModal ? "max-h-[70vh] max-w-full object-contain" : "w-full h-full object-cover"}
          controls={isModal}
          muted={!isModal}
          loop
          playsInline
          autoPlay={isModal}
        />
      );
    }
    return (
      <img
        src={item.mediaUrl}
        alt={item.title || "Portfolio image"}
        className={isModal ? "max-h-[70vh] max-w-full object-contain" : "w-full h-full object-cover"}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-normal mb-4" data-testid="text-gallery-title">
              Portfolio
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Explore our creative work — websites, videos, mockups, and more.
            </p>
            
            {getPaymentLinks().length > 0 && (
              <Button
                size="lg"
                onClick={() => setShowTipDialog(true)}
                className="rounded-full px-8"
                data-testid="button-tip"
              >
                <Heart className="h-5 w-5 mr-2" />
                Show Your Support
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : galleryItems && galleryItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden cursor-pointer hover-elevate"
                  onClick={() => setSelectedItem(item)}
                  data-testid={`card-gallery-item-${item.id}`}
                >
                  <div className="aspect-square overflow-hidden">
                    {renderMedia(item)}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No portfolio items yet.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95">
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-4 right-4 z-10 text-white/80 hover:text-white"
            data-testid="button-close-modal"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="flex items-center justify-center min-h-[50vh] p-4">
            {selectedItem && renderMedia(selectedItem, true)}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTipDialog} onOpenChange={setShowTipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Show Your Support</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Thank you for your support! Choose a payment method below:
            </p>
            {getPaymentLinks().map((link) => (
              <Button
                key={link.name}
                variant="outline"
                className="w-full justify-between"
                onClick={() => window.open(link.url, "_blank")}
                data-testid={`button-tip-${link.name.toLowerCase().replace(" ", "-")}`}
              >
                <span>Support with {link.name}</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
