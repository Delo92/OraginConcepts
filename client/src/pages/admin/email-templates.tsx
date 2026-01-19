import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Save, Send, Mail, User, Info } from "lucide-react";

interface EmailTemplate {
  id?: number;
  templateType: string;
  subject: string;
  body: string;
  isActive: boolean;
}

export default function EmailTemplates() {
  const { toast } = useToast();
  const [testEmail, setTestEmail] = useState("");
  const [editedTemplates, setEditedTemplates] = useState<Record<string, EmailTemplate>>({});

  const { data: templates = [], isLoading } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/admin/email-templates"],
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ templateType, data }: { templateType: string; data: Partial<EmailTemplate> }) => {
      const res = await apiRequest("PUT", `/api/admin/email-templates/${templateType}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-templates"] });
      toast({
        title: "Template Saved",
        description: "Email template has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save template",
        variant: "destructive",
      });
    },
  });

  const sendTestEmailMutation = useMutation({
    mutationFn: async ({ to, templateType }: { to: string; templateType: string }) => {
      const res = await apiRequest("POST", "/api/admin/email-templates/test", { to, templateType });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Test Email Sent",
        description: "Check your inbox for the test email.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    },
  });

  const getTemplate = (templateType: string): EmailTemplate => {
    if (editedTemplates[templateType]) {
      return editedTemplates[templateType];
    }
    return templates.find(t => t.templateType === templateType) || {
      templateType,
      subject: "",
      body: "",
      isActive: true
    };
  };

  const updateLocalTemplate = (templateType: string, updates: Partial<EmailTemplate>) => {
    const current = getTemplate(templateType);
    setEditedTemplates(prev => ({
      ...prev,
      [templateType]: { ...current, ...updates }
    }));
  };

  const handleSave = (templateType: string) => {
    const template = getTemplate(templateType);
    updateTemplateMutation.mutate({
      templateType,
      data: {
        subject: template.subject,
        body: template.body,
        isActive: template.isActive
      }
    });
  };

  const handleSendTest = (templateType: string) => {
    if (!testEmail) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to send the test to.",
        variant: "destructive",
      });
      return;
    }
    sendTestEmailMutation.mutate({ to: testEmail, templateType });
  };

  const templateLabels: Record<string, { title: string; description: string; icon: React.ReactNode }> = {
    booking_confirmation: {
      title: "Client Confirmation Email",
      description: "Sent to clients when they submit a booking request",
      icon: <User className="h-5 w-5" />
    },
    admin_notification: {
      title: "Admin Notification Email",
      description: "Sent to you when a new booking request comes in",
      icon: <Mail className="h-5 w-5" />
    }
  };

  const availableVariables = [
    { name: "{{clientName}}", description: "Client's full name" },
    { name: "{{clientEmail}}", description: "Client's email address" },
    { name: "{{clientPhone}}", description: "Client's phone number" },
    { name: "{{services}}", description: "Selected service name(s)" },
    { name: "{{bookingDate}}", description: "Booking date" },
    { name: "{{bookingTime}}", description: "Booking time" },
    { name: "{{totalPrice}}", description: "Total price" },
    { name: "{{notes}}", description: "Client's notes" },
    { name: "{{businessName}}", description: "Your business name" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-serif">Email Templates</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif">Email Templates</h1>
        <p className="text-muted-foreground">
          Customize the emails sent to clients and yourself when bookings are made.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Available Variables
          </CardTitle>
          <CardDescription>
            Use these placeholders in your templates. They will be replaced with actual values.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {availableVariables.map(v => (
              <div key={v.name} className="bg-muted px-3 py-1 rounded-full text-sm" title={v.description}>
                {v.name}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send Test Email</CardTitle>
          <CardDescription>
            Enter an email address to test your templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="your@email.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="booking_confirmation" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="booking_confirmation">Client Confirmation</TabsTrigger>
          <TabsTrigger value="admin_notification">Admin Notification</TabsTrigger>
        </TabsList>

        {["booking_confirmation", "admin_notification"].map(templateType => {
          const template = getTemplate(templateType);
          const label = templateLabels[templateType];

          return (
            <TabsContent key={templateType} value={templateType}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {label.icon}
                      <div>
                        <CardTitle>{label.title}</CardTitle>
                        <CardDescription>{label.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`active-${templateType}`} className="text-sm">Active</Label>
                      <Switch
                        id={`active-${templateType}`}
                        checked={template.isActive}
                        onCheckedChange={(checked) => updateLocalTemplate(templateType, { isActive: checked })}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`subject-${templateType}`}>Subject Line</Label>
                    <Input
                      id={`subject-${templateType}`}
                      value={template.subject}
                      onChange={(e) => updateLocalTemplate(templateType, { subject: e.target.value })}
                      placeholder="Email subject..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`body-${templateType}`}>Email Body (HTML)</Label>
                    <Textarea
                      id={`body-${templateType}`}
                      value={template.body}
                      onChange={(e) => updateLocalTemplate(templateType, { body: e.target.value })}
                      placeholder="Email content..."
                      rows={15}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleSave(templateType)}
                      disabled={updateTemplateMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Template
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleSendTest(templateType)}
                      disabled={sendTestEmailMutation.isPending || !testEmail}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Test Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
