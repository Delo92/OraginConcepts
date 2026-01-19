import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ShoppingCart, Calendar, CreditCard, CheckCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface PaymentMethod {
  id: number;
  providerType: string;
  displayName: string;
  paymentLink: string | null;
  isActive: boolean;
}

export default function Checkout() {
  const { items, total, visitorId, clearCart } = useCart();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    notes: "",
    paymentMethod: "",
  });

  const { data: paymentMethods = [] } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/payment-methods"],
  });

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName || !formData.clientEmail) {
      toast({
        title: "Missing information",
        description: "Please fill in your name and email.",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add services to your cart before checkout.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone,
          paymentMethod: formData.paymentMethod || "pending",
          notes: formData.notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Checkout failed");
      }

      const result = await response.json();
      setOrderId(result.orderId);
      setOrderComplete(true);
      
      toast({
        title: "Order submitted!",
        description: "Your booking request has been received. We'll be in touch soon!",
      });
    } catch (error) {
      toast({
        title: "Checkout failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
              <h1 className="font-serif text-4xl font-light mb-4">Order Confirmed!</h1>
              <p className="text-muted-foreground text-lg mb-2">
                Thank you for your order. We've received your booking request.
              </p>
              <p className="text-sm text-muted-foreground">
                Order ID: {orderId}
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold mb-4">What happens next?</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>1. We'll review your order and confirm availability</li>
                <li>2. You'll receive an email with booking details</li>
                <li>3. A calendar invite will be sent for your scheduled sessions</li>
                <li>4. Payment instructions will follow based on your selected method</li>
              </ul>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate("/")}>
                Back to Home
              </Button>
              <Button variant="outline" onClick={() => navigate("/services")}>
                Browse More Services
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h1 className="font-serif text-3xl font-light mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Add some services to your cart before checking out.
            </p>
            <Button onClick={() => navigate("/services")}>
              Browse Services
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-24 pb-12 px-4 bg-card border-b border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-4xl font-light mb-4">Checkout</h1>
          <p className="text-muted-foreground">
            Complete your order and we'll get started on your project.
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Your Order
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start py-2">
                      <div>
                        <p className="font-medium">{item.serviceName}</p>
                        {(item.scheduledDate || item.scheduledTime) && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {item.scheduledDate && new Date(item.scheduledDate).toLocaleDateString()}
                            {item.scheduledTime && ` at ${item.scheduledTime}`}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Your Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone (optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    {paymentMethods.length > 0 && (
                      <div>
                        <Label>Payment Method</Label>
                        <div className="grid gap-2 mt-2">
                          {paymentMethods.filter(m => m.isActive).map((method) => (
                            <label
                              key={method.id}
                              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                                formData.paymentMethod === method.providerType
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-muted-foreground"
                              }`}
                            >
                              <input
                                type="radio"
                                name="paymentMethod"
                                value={method.providerType}
                                checked={formData.paymentMethod === method.providerType}
                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                className="sr-only"
                              />
                              <CreditCard className="h-5 w-5 text-muted-foreground" />
                              <span className="font-medium">{method.displayName}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="notes">Notes (optional)</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Any special requests or details about your project..."
                        rows={3}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Complete Order - ${formatPrice(total)}`
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
