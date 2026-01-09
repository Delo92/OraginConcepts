import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpload } from "@/hooks/use-upload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Clock, DollarSign, Image as ImageIcon, X, Sun, Moon, Users, Upload, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Service, InsertService, GalleryItem } from "@shared/schema";

const serviceFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  duration: z.number().min(15, "Minimum 15 minutes").max(480, "Maximum 8 hours"),
  price: z.number().min(1, "Minimum $1.00"),
  imageUrl: z.string().optional().or(z.literal("")),
  displayMode: z.string().default("both"),
  isActive: z.boolean(),
  sortOrder: z.number(),
});

type ServiceFormData = z.infer<typeof serviceFormSchema>;

export default function AdminServices() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const { data: galleryItems } = useQuery<GalleryItem[]>({
    queryKey: ["/api/gallery"],
  });

  const imageGalleryItems = galleryItems?.filter(item => item.mediaType === "image") || [];

  const { uploadFile, isUploading } = useUpload({
    onSuccess: (response) => {
      form.setValue("imageUrl", response.objectPath);
      toast({ title: "Image uploaded successfully" });
    },
    onError: (error) => {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid file", description: "Please select an image file", variant: "destructive" });
        return;
      }
      await uploadFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      duration: 60,
      price: 80,
      imageUrl: "",
      displayMode: "both",
      isActive: true,
      sortOrder: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertService) => {
      const res = await apiRequest("POST", "/api/services", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: "Success", description: "Service created successfully!" });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertService> }) => {
      const res = await apiRequest("PATCH", `/api/services/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: "Success", description: "Service updated successfully!" });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: "Success", description: "Service deleted successfully!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      form.reset({
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price / 100,
        imageUrl: service.imageUrl || "",
        displayMode: service.displayMode || "both",
        isActive: service.isActive,
        sortOrder: service.sortOrder,
      });
    } else {
      setEditingService(null);
      form.reset({
        name: "",
        description: "",
        duration: 60,
        price: 80,
        imageUrl: "",
        displayMode: "both",
        isActive: true,
        sortOrder: (services?.length || 0) + 1,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingService(null);
    form.reset();
  };

  const onSubmit = (data: ServiceFormData) => {
    const serviceData: InsertService = {
      ...data,
      price: Math.round(data.price * 100),
      imageUrl: data.imageUrl || null,
    };

    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data: serviceData });
    } else {
      createMutation.mutate(serviceData);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl font-normal mb-2" data-testid="text-admin-services-title">
            Services
          </h1>
          <p className="text-muted-foreground">Manage your creative services and packages.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} data-testid="button-add-service">
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif">
                {editingService ? "Edit Service" : "Add New Service"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Website Development" {...field} data-testid="input-service-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Professional website design and development tailored to your brand..."
                          className="resize-none min-h-24"
                          {...field}
                          data-testid="input-service-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={15}
                            max={480}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-service-duration"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            step="0.01"
                            placeholder="80.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-service-price"
                          />
                        </FormControl>
                        <FormDescription>Enter price in dollars</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Image (optional)</FormLabel>
                      {field.value && (
                        <div className="relative w-24 h-24 rounded-md overflow-hidden border mb-2">
                          <img
                            src={field.value}
                            alt="Selected image"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => field.onChange("")}
                            className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white"
                            data-testid="button-remove-image"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      
                      {/* Upload new image button */}
                      <div className="mb-3">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          accept="image/*"
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="w-full"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload New Image
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Or select from portfolio */}
                      {imageGalleryItems.length > 0 && (
                        <>
                          <p className="text-xs text-muted-foreground mb-2">Or select from portfolio:</p>
                          <ScrollArea className="h-24 border rounded-md p-2">
                            <div className="flex gap-2 flex-wrap">
                              {imageGalleryItems.map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => field.onChange(item.mediaUrl)}
                                  className={`relative w-14 h-14 rounded-md overflow-hidden border-2 transition-all ${
                                    field.value === item.mediaUrl
                                      ? "border-primary ring-2 ring-primary/50"
                                      : "border-transparent hover:border-muted-foreground/50"
                                  }`}
                                  data-testid={`button-select-gallery-${item.id}`}
                                >
                                  <img
                                    src={item.mediaUrl}
                                    alt={item.title || "Portfolio image"}
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              ))}
                            </div>
                          </ScrollArea>
                        </>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="displayMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Mode</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "both"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select display mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="professional">
                            <div className="flex items-center gap-2">
                              <Sun className="h-4 w-4" />
                              <span>Yin (Light)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="edge">
                            <div className="flex items-center gap-2">
                              <Moon className="h-4 w-4" />
                              <span>Yang (Dark)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="both">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>Both Modes</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Choose which portfolio view this service appears in</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <FormLabel className="font-normal">Active</FormLabel>
                        <FormDescription>Show this service on the website</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-service-active"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-service"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : editingService
                      ? "Update Service"
                      : "Create Service"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-60" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : services && services.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id} data-testid={`row-admin-service-${service.id}`}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {service.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatDuration(service.duration)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        {(service.price / 100).toFixed(0)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {service.isActive ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(service)}
                          data-testid={`button-edit-service-${service.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this service?")) {
                              deleteMutation.mutate(service.id);
                            }
                          }}
                          data-testid={`button-delete-service-${service.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No services yet. Add your first service to get started.</p>
              <Button onClick={() => handleOpenDialog()} data-testid="button-add-first-service">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Service
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
