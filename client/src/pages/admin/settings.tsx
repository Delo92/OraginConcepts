import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CreditCard, Store, Phone, Plus, Trash2, Lock, Link as LinkIcon } from "lucide-react";
import type { SiteSettings, PaymentMethod } from "@shared/schema";
import { PAYMENT_PROVIDERS, type PaymentProviderType } from "@shared/schema";

const settingsFormSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  tagline: z.string().optional(),
  aboutText: z.string().optional(),
  heroImageUrl: z.string().url().optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  hoursOfOperation: z.string().optional(),
  footerTagline: z.string().optional(),
});

function PaymentMethodsSection() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProviderType | "">("");
  const [credentials, setCredentials] = useState<Record<string, string>>({});

  const { data: paymentMethods = [], isLoading } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/payment-methods"],
  });

  const addMutation = useMutation({
    mutationFn: async (data: { providerType: string; credentials: Record<string, string> }) => {
      const res = await apiRequest("POST", "/api/payment-methods", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      toast({ title: "Success", description: "Payment method added successfully!" });
      setIsAddDialogOpen(false);
      setSelectedProvider("");
      setCredentials({});
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/payment-methods/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      toast({ title: "Success", description: "Payment method removed!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleAddPaymentMethod = () => {
    if (!selectedProvider) return;
    addMutation.mutate({ providerType: selectedProvider, credentials });
  };

  const providerOptions = Object.entries(PAYMENT_PROVIDERS).filter(
    ([key]) => !paymentMethods.some(m => m.providerType === key)
  );

  const currentProvider = selectedProvider ? PAYMENT_PROVIDERS[selectedProvider] : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle className="font-serif text-lg">Payment Methods</CardTitle>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" disabled={providerOptions.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Provider</label>
                  <Select
                    value={selectedProvider}
                    onValueChange={(value) => {
                      setSelectedProvider(value as PaymentProviderType);
                      setCredentials({});
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a payment provider..." />
                    </SelectTrigger>
                    <SelectContent>
                      {providerOptions.map(([key, provider]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            {provider.type === "api" ? (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <LinkIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                            {provider.name}
                            {provider.type === "api" && (
                              <span className="text-xs text-muted-foreground">(API)</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {currentProvider && (
                  <div className="space-y-3">
                    {currentProvider.fields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <label className="text-sm font-medium">{field.label}</label>
                        <Input
                          type={(field as any).sensitive ? "password" : "text"}
                          placeholder={field.placeholder}
                          value={credentials[field.key] || ""}
                          onChange={(e) =>
                            setCredentials({ ...credentials, [field.key]: e.target.value })
                          }
                        />
                      </div>
                    ))}
                    {currentProvider.type === "api" && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        API credentials are encrypted before storage
                      </p>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={handleAddPaymentMethod}
                  disabled={!selectedProvider || addMutation.isPending}
                >
                  {addMutation.isPending ? "Adding..." : "Add Payment Method"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          Manage your payment options. Add payment links or connect payment processors.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : paymentMethods.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No payment methods configured. Click "Add Payment Method" to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const provider = PAYMENT_PROVIDERS[method.providerType as PaymentProviderType];
              return (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card"
                >
                  <div className="flex items-center gap-3">
                    {provider?.type === "api" ? (
                      <Lock className="h-5 w-5 text-primary" />
                    ) : (
                      <LinkIcon className="h-5 w-5 text-primary" />
                    )}
                    <div>
                      <p className="font-medium">{method.displayName}</p>
                      <p className="text-sm text-muted-foreground">
                        {provider?.type === "api" ? (
                          <span className="flex items-center gap-1">
                            <Lock className="h-3 w-3" /> API credentials configured
                          </span>
                        ) : (
                          method.paymentLink || "No link configured"
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteMutation.mutate(method.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type SettingsFormData = z.infer<typeof settingsFormSchema>;

export default function AdminSettings() {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      businessName: "Oraginal Concepts",
      tagline: "",
      aboutText: "",
      heroImageUrl: "",
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
        businessName: settings.businessName || "Oraginal Concepts",
        tagline: settings.tagline || "",
        aboutText: settings.aboutText || "",
        heroImageUrl: settings.heroImageUrl || "",
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
                        placeholder="Give Me Your Concept, Let's Make It Real."
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
                        placeholder="Tell your clients about your creative services..."
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

          <PaymentMethodsSection />

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
                        placeholder="contact@oraginalconcepts.com"
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
                        placeholder="Mon - Fri: 9:00 AM - 6:00 PM"
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
                        placeholder="Give Me Your Concept, Let's Make It Real..."
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
