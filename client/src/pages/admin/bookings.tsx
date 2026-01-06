import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Calendar, Clock, Mail, Phone } from "lucide-react";
import type { Booking, Service } from "@shared/schema";

export default function AdminBookings() {
  const { toast } = useToast();

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/bookings/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: "Success", description: "Booking status updated!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ id, paymentStatus }: { id: number; paymentStatus: string }) => {
      const res = await apiRequest("PATCH", `/api/bookings/${id}`, { paymentStatus });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: "Success", description: "Payment status updated!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const getServiceName = (serviceId: number) => {
    return services?.find((s) => s.id === serviceId)?.name || "Unknown Service";
  };

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Confirmed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Paid</Badge>;
      case "unpaid":
        return <Badge variant="outline">Unpaid</Badge>;
      case "refunded":
        return <Badge variant="secondary">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const sortedBookings = bookings?.sort((a, b) => {
    const dateA = new Date(`${a.bookingDate}T${a.bookingTime}`);
    const dateB = new Date(`${b.bookingDate}T${b.bookingTime}`);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-normal mb-2" data-testid="text-admin-bookings-title">
          Bookings
        </h1>
        <p className="text-muted-foreground">View and manage all booking requests.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-60" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedBookings && sortedBookings.length > 0 ? (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedBookings.map((booking) => (
                      <TableRow key={booking.id} data-testid={`row-admin-booking-${booking.id}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{booking.clientName}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {booking.clientEmail}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {booking.clientPhone}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getServiceName(booking.serviceId)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {format(new Date(booking.bookingDate), "MMM d, yyyy")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {formatTimeDisplay(booking.bookingTime)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={booking.status}
                            onValueChange={(value) =>
                              updateStatusMutation.mutate({ id: booking.id, status: value })
                            }
                          >
                            <SelectTrigger className="w-32" data-testid={`select-status-${booking.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={booking.paymentStatus}
                            onValueChange={(value) =>
                              updatePaymentMutation.mutate({ id: booking.id, paymentStatus: value })
                            }
                          >
                            <SelectTrigger className="w-28" data-testid={`select-payment-${booking.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unpaid">Unpaid</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="refunded">Refunded</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          {booking.notes && (
                            <Button variant="ghost" size="sm" title={booking.notes}>
                              Notes
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="lg:hidden divide-y">
                {sortedBookings.map((booking) => (
                  <div key={booking.id} className="p-4 space-y-3" data-testid={`card-booking-${booking.id}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-lg">{booking.clientName}</p>
                        <p className="text-sm text-muted-foreground">{getServiceName(booking.serviceId)}</p>
                      </div>
                      <div className="text-right text-sm">
                        <div className="flex items-center gap-1 justify-end">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(booking.bookingDate), "MMM d, yyyy")}
                        </div>
                        <div className="flex items-center gap-1 justify-end mt-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {formatTimeDisplay(booking.bookingTime)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {booking.clientEmail}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {booking.clientPhone}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex-1 min-w-[120px]">
                        <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                        <Select
                          value={booking.status}
                          onValueChange={(value) =>
                            updateStatusMutation.mutate({ id: booking.id, status: value })
                          }
                        >
                          <SelectTrigger className="w-full" data-testid={`select-status-mobile-${booking.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <label className="text-xs text-muted-foreground mb-1 block">Payment</label>
                        <Select
                          value={booking.paymentStatus}
                          onValueChange={(value) =>
                            updatePaymentMutation.mutate({ id: booking.id, paymentStatus: value })
                          }
                        >
                          <SelectTrigger className="w-full" data-testid={`select-payment-mobile-${booking.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unpaid">Unpaid</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {booking.notes && (
                      <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                        {booking.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No bookings yet. Bookings will appear here once clients start booking.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
