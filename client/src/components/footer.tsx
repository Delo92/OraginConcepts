import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Phone, Mail, Clock } from "lucide-react";
import type { SiteSettings } from "@shared/schema";

export function Footer() {
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const businessName = settings?.businessName || "The Neitzke Way";
  const footerTagline = settings?.footerTagline || "Experience the art of therapeutic massage. Your journey to relaxation and wellness begins here.";
  const hoursOfOperation = settings?.hoursOfOperation || "Mon - Sat: 9:00 AM - 7:00 PM";
  const contactEmail = settings?.contactEmail || "contact@theneitzekway.com";

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif text-xl font-medium mb-4" data-testid="text-footer-business-name">{businessName}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed" data-testid="text-footer-tagline">
              {footerTagline}
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <span className="text-muted-foreground text-sm hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-home">
                    Home
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/services">
                  <span className="text-muted-foreground text-sm hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-services">
                    Services
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/book">
                  <span className="text-muted-foreground text-sm hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-book">
                    Book Now
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/admin">
                  <span className="text-muted-foreground text-sm hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-admin">
                    Owner Login
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Contact</h4>
            <ul className="space-y-3">
              {hoursOfOperation && (
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span data-testid="text-footer-hours">{hoursOfOperation}</span>
                </li>
              )}
              {contactEmail && (
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span data-testid="text-footer-email">{contactEmail}</span>
                </li>
              )}
              {settings?.contactPhone && (
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span data-testid="text-footer-phone">{settings.contactPhone}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm" data-testid="text-footer-copyright">
            &copy; {new Date().getFullYear()} {businessName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
