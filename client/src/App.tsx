import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { DisplayModeProvider } from "@/contexts/display-mode-context";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { AdminLayout } from "@/components/admin-layout";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Services from "@/pages/services";
import Booking from "@/pages/booking";
import Gallery from "@/pages/gallery";
import Project from "@/pages/project";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminServices from "@/pages/admin/services";
import AdminBookings from "@/pages/admin/bookings";
import AdminAvailability from "@/pages/admin/availability";
import AdminSettings from "@/pages/admin/settings";
import AdminGallery from "@/pages/admin/gallery";
import AdminProjectMedia from "@/pages/admin/project-media";

function AdminRoutes() {
  const { isAdmin, isLoading } = useAdminAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (location === "/admin/login") {
    if (isAdmin) {
      window.location.href = "/admin";
      return null;
    }
    return <AdminLogin />;
  }

  if (!isAdmin) {
    return <AdminLogin />;
  }

  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/services" component={AdminServices} />
        <Route path="/admin/bookings" component={AdminBookings} />
        <Route path="/admin/availability" component={AdminAvailability} />
        <Route path="/admin/gallery" component={AdminGallery} />
        <Route path="/admin/projects/:projectId" component={AdminProjectMedia} />
        <Route path="/admin/settings" component={AdminSettings} />
        <Route component={NotFound} />
      </Switch>
    </AdminLayout>
  );
}

function PublicRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/services" component={Services} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/projects/:projectId" component={Project} />
      <Route path="/book" component={Booking} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  const [location] = useLocation();
  
  if (location.startsWith("/admin")) {
    return <AdminRoutes />;
  }

  return <PublicRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <DisplayModeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </DisplayModeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
