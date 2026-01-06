import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const bookingFormSchema = z.object({
  clientName: z.string().min(2, "Name must be at least 2 characters"),
  clientEmail: z.string().email("Please enter a valid email"),
  clientPhone: z.string().min(10, "Please enter a valid phone number"),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => void;
  isSubmitting?: boolean;
}

export function BookingForm({ onSubmit, isSubmitting }: BookingFormProps) {
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      notes: "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-lg">Your Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                      data-testid="input-client-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      {...field}
                      data-testid="input-client-email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="(555) 123-4567"
                      {...field}
                      data-testid="input-client-phone"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Details (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your concept, ideas, or specific requirements..."
                      className="resize-none"
                      {...field}
                      data-testid="input-client-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              data-testid="button-submit-booking"
            >
              {isSubmitting ? "Processing..." : "Continue to Payment"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
