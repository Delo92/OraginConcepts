import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Users, Package, DollarSign, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import type { Booking, Service } from "@shared/schema";

export default function AdminDashboard() {
  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const pendingBookings = bookings?.filter((b) => b.status === "pending") || [];
  const todayBookings = bookings?.filter((b) => b.bookingDate === format(new Date(), "yyyy-MM-dd")) || [];
  const activeServices = services?.filter((s) => s.isActive) || [];

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-normal mb-2" data-testid="text-admin-dashboard-title">
          Dashboard
        </h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your creative business.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Today's Projects</p>
                {bookingsLoading ? (
                  <Skeleton className="h-8 w-12 mt-1" />
                ) : (
                  <p className="text-3xl font-medium" data-testid="text-today-bookings">
                    {todayBookings.length}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                {bookingsLoading ? (
                  <Skeleton className="h-8 w-12 mt-1" />
                ) : (
                  <p className="text-3xl font-medium" data-testid="text-pending-bookings">
                    {pendingBookings.length}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Active Services</p>
                {servicesLoading ? (
                  <Skeleton className="h-8 w-12 mt-1" />
                ) : (
                  <p className="text-3xl font-medium" data-testid="text-active-services">
                    {activeServices.length}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                {bookingsLoading ? (
                  <Skeleton className="h-8 w-12 mt-1" />
                ) : (
                  <p className="text-3xl font-medium" data-testid="text-total-bookings">
                    {bookings?.length || 0}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="font-serif text-lg">Upcoming Projects</CardTitle>
            <Link href="/admin/bookings">
              <Button variant="ghost" size="sm" data-testid="link-view-all-bookings">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : pendingBookings.length > 0 ? (
              <div className="space-y-1">
                {pendingBookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between gap-4 py-3 border-b last:border-0 flex-wrap"
                    data-testid={`row-booking-${booking.id}`}
                  >
                    <div>
                      <p className="font-medium">{booking.clientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(booking.bookingDate), "MMM d")} at{" "}
                        {formatTimeDisplay(booking.bookingTime)}
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No pending projects.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="font-serif text-lg">Your Services</CardTitle>
            <Link href="/admin/services">
              <Button variant="ghost" size="sm" data-testid="link-manage-services">
                Manage
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {servicesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : activeServices.length > 0 ? (
              <div className="space-y-1">
                {activeServices.slice(0, 5).map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between gap-4 py-3 border-b last:border-0 flex-wrap"
                    data-testid={`row-service-${service.id}`}
                  >
                    <p className="font-medium">{service.name}</p>
                    <Badge variant="secondary">${(service.price / 100).toFixed(0)}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No services yet.</p>
                <Link href="/admin/services">
                  <Button size="sm" data-testid="button-add-first-service">Add Your First Service</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
