import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Lock, Loader2, User, Shield } from "lucide-react";

type UserLevel = "client" | "admin";

export default function AdminLogin() {
  const [userLevel, setUserLevel] = useState<UserLevel>("client");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const adminLoginMutation = useMutation({
    mutationFn: async (password: string) => {
      const res = await apiRequest("POST", "/api/admin/login", { password });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/session"] });
      setLocation("/admin");
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: "Incorrect password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const clientLoginMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/client/login", { email });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client/session"] });
      setLocation("/client/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: "No bookings found for this email address.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userLevel === "admin" && password.trim()) {
      adminLoginMutation.mutate(password);
    } else if (userLevel === "client" && email.trim()) {
      clientLoginMutation.mutate(email);
    }
  };

  const isPending = adminLoginMutation.isPending || clientLoginMutation.isPending;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            {userLevel === "admin" ? (
              <Shield className="h-8 w-8 text-primary" />
            ) : (
              <User className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle className="font-serif text-2xl">
            {userLevel === "admin" ? "Owner Login" : "Client Login"}
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-2">
            {userLevel === "admin" 
              ? "Enter your admin password to access the dashboard" 
              : "Enter your email to view your bookings"}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              type="button"
              variant={userLevel === "client" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setUserLevel("client")}
            >
              <User className="h-4 w-4 mr-2" />
              Client
            </Button>
            <Button
              type="button"
              variant={userLevel === "admin" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setUserLevel("admin")}
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {userLevel === "admin" ? (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                  data-testid="input-admin-password"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending}
                  data-testid="input-client-email"
                />
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isPending || (userLevel === "admin" ? !password.trim() : !email.trim())}
              data-testid="button-login"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-back-home"
            >
              Back to website
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
