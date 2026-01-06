import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CreditCard, Store, Phone, Mail, MapPin } from "lucide-react";
import type { SiteSettings } from "@shared/schema";

const settingsFormSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  tagline: z.string().optional(),
  aboutText: z.string().optional(),
  heroImageUrl: z.string().url().optional().or(z.literal("")),
  cashappLink: z.string().url().optional().or(z.literal("")),
  chimeLink: z.string().url().optional().or(z.literal("")),
  applepayLink: z.string().url().optional().or(z.literal("")),
  venmoLink: z.string().url().optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  hoursOfOperation: z.string().optional(),
  footerTagline: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsFormSchema>;

export default function AdminSettings() {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      businessName: "The Neitzke Way",
      tagline: "",
      aboutText: "",
      heroImageUrl: "",
      cashappLink: "",
      chimeLink: "",
      applepayLink: "",
      venmoLink: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
      hoursOfOperation: "",
      footerTagline: "",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        businessName: settings.businessName || "The Neitzke Way",
        tagline: settings.tagline || "",
        aboutText: settings.aboutText || "",
        heroImageUrl: settings.heroImageUrl || "",
        cashappLink: settings.cashappLink || "",
        chimeLink: settings.chimeLink || "",
        applepayLink: settings.applepayLink || "",
        venmoLink: settings.venmoLink || "",
        contactEmail: settings.contactEmail || "",
        contactPhone: settings.contactPhone || "",
        address: settings.address || "",
        hoursOfOperation: settings.hoursOfOperation || "",
        footerTagline: settings.footerTagline || "",
      });
    }
  }, [settings, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      const res = await apiRequest("PUT", "/api/settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Success", description: "Settings saved successfully!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-normal mb-2" data-testid="text-admin-settings-title">
          Settings
        </h1>
        <p className="text-muted-foreground">Customize your business information and payment links.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                <CardTitle className="font-serif text-lg">Business Information</CardTitle>
              </div>
              <CardDescription>
                Update your business name, tagline, and about text displayed on your website.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-business-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tagline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tagline</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your journey to relaxation begins here..."
                        {...field}
                        data-testid="input-tagline"
                      />
                    </FormControl>
                    <FormDescription>A short slogan displayed on your homepage.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aboutText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell your clients about your practice..."
                        className="resize-none min-h-32"
                        {...field}
                        data-testid="input-about-text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="heroImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hero Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/hero.jpg"
                        {...field}
                        data-testid="input-hero-image"
                      />
                    </FormControl>
                    <FormDescription>The main background image on your homepage.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <CardTitle className="font-serif text-lg">Payment Links</CardTitle>
              </div>
              <CardDescription>
                Add your payment links. Clients will be redirected to these links to complete payment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="cashappLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cash App Link</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://cash.app/$yourusername"
                        {...field}
                        data-testid="input-cashapp"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="venmoLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venmo Link</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://venmo.com/yourusername"
                        {...field}
                        data-testid="input-venmo"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chimeLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chime Link</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your Chime payment link"
                        {...field}
                        data-testid="input-chime"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="applepayLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apple Pay Link</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your Apple Pay link"
                        {...field}
                        data-testid="input-applepay"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                <CardTitle className="font-serif text-lg">Contact Information</CardTitle>
              </div>
              <CardDescription>
                Your contact details displayed in the footer and contact sections.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="contact@theneitzekway.com"
                        {...field}
                        data-testid="input-contact-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="(555) 123-4567"
                        {...field}
                        data-testid="input-contact-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="123 Main St, City, State 12345"
                        className="resize-none"
                        {...field}
                        data-testid="input-address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hoursOfOperation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours of Operation</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Mon - Sat: 9:00 AM - 7:00 PM"
                        {...field}
                        data-testid="input-hours"
                      />
                    </FormControl>
                    <FormDescription>Displayed in the footer.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="footerTagline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Footer Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Experience the art of therapeutic massage..."
                        className="resize-none"
                        {...field}
                        data-testid="input-footer-tagline"
                      />
                    </FormControl>
                    <FormDescription>Short description shown in the footer.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={updateMutation.isPending}
              data-testid="button-save-settings"
            >
              {updateMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
