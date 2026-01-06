import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { BookingCalendar } from "@/components/booking-calendar";
import { BookingForm } from "@/components/booking-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, ArrowRight, Check, ExternalLink, Clock, DollarSign } from "lucide-react";
import type { Service, SiteSettings, InsertBooking } from "@shared/schema";

type BookingStep = "service" | "datetime" | "info" | "payment" | "confirmed";

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function Booking() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const preselectedService = params.get("service");

  const [step, setStep] = useState<BookingStep>("service");
  const [selectedServiceId, setSelectedServiceId] = useState<string>(preselectedService || "");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [clientInfo, setClientInfo] = useState<{
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    notes?: string;
  } | null>(null);
  const [bookingId, setBookingId] = useState<number | null>(null);

  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const { data: blockedDates } = useQuery<{ date: string }[]>({
    queryKey: ["/api/blocked-dates"],
  });

  const { data: availableSlots, isLoading: slotsLoading, isError: slotsError } = useQuery<TimeSlot[]>({
    queryKey: ["/api/availability/slots", selectedDate ? format(selectedDate, "yyyy-MM-dd") : null, selectedServiceId],
    queryFn: async () => {
      if (!selectedDate || !selectedServiceId) return [];
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const res = await fetch(`/api/availability/slots?date=${dateStr}&serviceId=${selectedServiceId}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch available times");
      }
      return res.json();
    },
    enabled: !!selectedDate && !!selectedServiceId,
  });

  const createBookingMutation = useMutation({
    mutationFn: async (booking: InsertBooking) => {
      const res = await apiRequest("POST", "/api/bookings", booking);
      return res.json();
    },
    onSuccess: (data) => {
      setBookingId(data.id);
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setStep("payment");
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Unable to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const selectedService = services?.find((s) => s.id.toString() === selectedServiceId);
  const activeServices = services?.filter((s) => s.isActive) || [];

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;
  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? "s" : ""}`;
    }
    return `${minutes} minutes`;
  };

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setSelectedDate(undefined);
    setSelectedTime(undefined);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(undefined);
  };

  const handleFormSubmit = (data: {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    notes?: string;
  }) => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    setClientInfo(data);

    createBookingMutation.mutate({
      serviceId: selectedService.id,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      bookingDate: format(selectedDate, "yyyy-MM-dd"),
      bookingTime: selectedTime,
      notes: data.notes || null,
      status: "pending",
      paymentStatus: "unpaid",
    });
  };

  const getPaymentLinks = () => {
    const links = [];
    if (settings?.cashappLink) links.push({ name: "Cash App", url: settings.cashappLink });
    if (settings?.venmoLink) links.push({ name: "Venmo", url: settings.venmoLink });
    if (settings?.chimeLink) links.push({ name: "Chime", url: settings.chimeLink });
    if (settings?.applepayLink) links.push({ name: "Apple Pay", url: settings.applepayLink });
    return links;
  };

  const canProceedFromService = !!selectedServiceId;
  const canProceedFromDateTime = !!selectedDate && !!selectedTime;

  const stepIndicators = [
    { key: "service", label: "Service" },
    { key: "datetime", label: "Date & Time" },
    { key: "info", label: "Your Info" },
    { key: "payment", label: "Payment" },
  ];

  const currentStepIndex = stepIndicators.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-24 pb-8 px-4 bg-card border-b border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-4xl font-light mb-4" data-testid="text-booking-title">
            Book Your Session
          </h1>
          <p className="text-muted-foreground">
            Reserve your appointment in just a few simple steps.
          </p>
        </div>
      </section>

      {step !== "confirmed" && (
        <section className="py-6 px-4 border-b border-border">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between gap-2">
              {stepIndicators.map((s, index) => (
                <div key={s.key} className="flex items-center flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        index < currentStepIndex
                          ? "bg-primary text-primary-foreground"
                          : index === currentStepIndex
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index < currentStepIndex ? <Check className="h-4 w-4" /> : index + 1}
                    </div>
                    <span
                      className={`text-sm hidden sm:block ${
                        index <= currentStepIndex ? "text-foreground font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {index < stepIndicators.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-3 ${
                        index < currentStepIndex ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {step === "service" && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl text-center mb-8">Select a Service</h2>

              {servicesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : activeServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeServices.map((service) => (
                    <Card
                      key={service.id}
                      className={`cursor-pointer transition-all hover-elevate ${
                        selectedServiceId === service.id.toString()
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                      onClick={() => handleServiceSelect(service.id.toString())}
                      data-testid={`card-select-service-${service.id}`}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                          <h3 className="font-serif text-lg font-medium">{service.name}</h3>
                          <Badge variant="secondary">{formatPrice(service.price)}</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{formatDuration(service.duration)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No services available.</p>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setStep("datetime")}
                  disabled={!canProceedFromService}
                  data-testid="button-next-datetime"
                >
                  Next: Select Date & Time
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === "datetime" && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => setStep("service")} data-testid="button-back-service">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="font-serif text-2xl">Select Date & Time</h2>
              </div>

              {selectedService && (
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-medium">{selectedService.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDuration(selectedService.duration)} • {formatPrice(selectedService.price)}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setStep("service")}>
                        Change
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <BookingCalendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                selectedTime={selectedTime}
                onTimeSelect={setSelectedTime}
                availableSlots={availableSlots || []}
                blockedDates={blockedDates?.map((d) => d.date) || []}
                isLoading={slotsLoading}
              />

              {slotsError && selectedDate && (
                <div className="text-center py-4">
                  <p className="text-destructive text-sm">
                    Unable to load available times. Please try again or select a different date.
                  </p>
                </div>
              )}

              <div className="flex justify-between pt-4 gap-4 flex-wrap">
                <Button variant="outline" onClick={() => setStep("service")} data-testid="button-back-service-2">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep("info")}
                  disabled={!canProceedFromDateTime}
                  data-testid="button-next-info"
                >
                  Next: Your Information
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === "info" && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => setStep("datetime")} data-testid="button-back-datetime">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="font-serif text-2xl">Your Information</h2>
              </div>

              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <p className="font-medium">{selectedService?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
                      {selectedTime && ` at ${formatTimeDisplay(selectedTime)}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedService && formatDuration(selectedService.duration)} •{" "}
                      {selectedService && formatPrice(selectedService.price)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="max-w-md mx-auto">
                <BookingForm
                  onSubmit={handleFormSubmit}
                  isSubmitting={createBookingMutation.isPending}
                />
              </div>

              <div className="flex justify-start pt-4">
                <Button variant="outline" onClick={() => setStep("datetime")} data-testid="button-back-datetime-2">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
            </div>
          )}

          {step === "payment" && (
            <div className="max-w-lg mx-auto space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-primary" />
                </div>
                <h2 className="font-serif text-2xl mb-2">Booking Reserved!</h2>
                <p className="text-muted-foreground">
                  Complete your payment to confirm your appointment.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-medium">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Date</span>
                    <span>{selectedDate && format(selectedDate, "MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Time</span>
                    <span>{selectedTime && formatTimeDisplay(selectedTime)}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Duration</span>
                    <span>{selectedService && formatDuration(selectedService.duration)}</span>
                  </div>
                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium">Total</span>
                      <span className="font-medium text-lg">
                        {selectedService && formatPrice(selectedService.price)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Payment Options</CardTitle>
                </CardHeader>
                <CardContent>
                  {getPaymentLinks().length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground mb-4">
                        Click a payment option below. You will be redirected to complete your payment.
                      </p>
                      {getPaymentLinks().map((link) => (
                        <Button
                          key={link.name}
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => window.open(link.url, "_blank")}
                          data-testid={`button-pay-${link.name.toLowerCase().replace(" ", "-")}`}
                        >
                          <span>Pay with {link.name}</span>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      Payment links not yet configured. Please contact us to arrange payment.
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStep("confirmed");
                  }}
                  data-testid="button-done"
                >
                  I've completed my payment
                </Button>
              </div>
            </div>
          )}

          {step === "confirmed" && (
            <div className="max-w-lg mx-auto text-center py-12">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Check className="h-10 w-10 text-primary" />
              </div>
              <h2 className="font-serif text-3xl mb-4" data-testid="text-booking-confirmed">
                Thank You!
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Your booking has been submitted. You will receive a confirmation once your payment is verified.
              </p>

              <Card className="mb-8 text-left">
                <CardContent className="p-6 space-y-3">
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-medium">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Date</span>
                    <span>{selectedDate && format(selectedDate, "MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Time</span>
                    <span>{selectedTime && formatTimeDisplay(selectedTime)}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Name</span>
                    <span>{clientInfo?.clientName}</span>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={() => setLocation("/")} data-testid="button-return-home">
                Return to Home
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
