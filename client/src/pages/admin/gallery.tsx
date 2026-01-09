import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Star, ImageIcon, Film, Loader2, Pencil, FolderOpen, Sun, Moon, Users } from "lucide-react";
import type { GalleryItem } from "@shared/schema";

export default function AdminGallery() {
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editProjectUrl, setEditProjectUrl] = useState("");
  const [editDisplayMode, setEditDisplayMode] = useState("both");
  const fileInputRef = useState<HTMLInputElement | null>(null);

  const { data: galleryItems, isLoading } = useQuery<GalleryItem[]>({
    queryKey: ["/api/gallery"],
  });

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: async (response) => {
      const mediaType = getMediaType(response.metadata.contentType);
      await createMutation.mutateAsync({
        mediaUrl: response.objectPath,
        mediaType,
        title: response.metadata.name,
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { mediaUrl: string; mediaType: string; title?: string }) => {
      return apiRequest("POST", "/api/gallery", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({ title: "Media uploaded successfully" });
    },
    onError: () => {
      toast({
        title: "Failed to save media",
        variant: "destructive",
      });
    },
  });

  const setHeroMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("POST", `/api/gallery/${id}/set-hero`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery/hero"] });
      toast({ title: "Hero image updated" });
    },
    onError: () => {
      toast({
        title: "Failed to set hero image",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/gallery/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery/hero"] });
      toast({ title: "Media deleted successfully" });
      setDeleteId(null);
    },
    onError: () => {
      toast({
        title: "Failed to delete media",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; title?: string; description?: string; projectUrl?: string; displayMode?: string }) => {
      const { id, ...updateData } = data;
      return apiRequest("PUT", `/api/gallery/${id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({ title: "Portfolio item updated" });
      setEditItem(null);
    },
    onError: () => {
      toast({
        title: "Failed to update portfolio item",
        variant: "destructive",
      });
    },
  });

  const handleEditClick = (item: GalleryItem) => {
    setEditItem(item);
    setEditTitle(item.title || "");
    setEditDescription(item.description || "");
    setEditProjectUrl(item.projectUrl || "");
    setEditDisplayMode(item.displayMode || "both");
  };

  const handleEditSave = () => {
    if (!editItem) return;
    updateMutation.mutate({
      id: editItem.id,
      title: editTitle || undefined,
      description: editDescription || undefined,
      projectUrl: editProjectUrl || undefined,
      displayMode: editDisplayMode,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "video/mp4",
        "video/webm",
        "video/quicktime",
      ];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image (JPG, PNG, GIF, WebP) or video (MP4, WebM, MOV)",
          variant: "destructive",
        });
        return;
      }
      await uploadFile(file);
      e.target.value = "";
    }
  };

  const getMediaType = (contentType: string): string => {
    if (contentType === "image/gif") return "gif";
    if (contentType.startsWith("video/")) return "video";
    return "image";
  };

  const renderMedia = (item: GalleryItem) => {
    const url = item.mediaUrl.startsWith("/objects/") ? item.mediaUrl : item.mediaUrl;
    
    if (item.mediaType === "video") {
      return (
        <video
          src={url}
          className="w-full h-full object-cover"
          muted
          loop
          playsInline
          onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
          onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
        />
      );
    }
    return (
      <img
        src={url}
        alt={item.title || "Portfolio item"}
        className="w-full h-full object-cover"
      />
    );
  };

  const getMediaIcon = (type: string) => {
    if (type === "video") return <Film className="h-3 w-3" />;
    return <ImageIcon className="h-3 w-3" />;
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-normal" data-testid="text-gallery-heading">
              Portfolio
            </h1>
            <p className="text-muted-foreground mt-1">
              Upload photos, videos, and GIFs. Set one as your home page hero.
            </p>
          </div>
          <div>
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
              id="media-upload"
              data-testid="input-file-upload"
            />
            <Button asChild disabled={isUploading || createMutation.isPending}>
              <label htmlFor="media-upload" className="cursor-pointer">
                {isUploading || createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Media
                  </>
                )}
              </label>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-md" />
            ))}
          </div>
        ) : galleryItems && galleryItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryItems.map((item) => (
              <Card key={item.id} className="overflow-hidden group relative" data-testid={`card-gallery-${item.id}`}>
                <CardContent className="p-0">
                  <div className="aspect-square relative overflow-hidden">
                    {renderMedia(item)}
                    <div className="absolute top-2 left-2 flex gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {getMediaIcon(item.mediaType)}
                        <span className="ml-1 capitalize">{item.mediaType}</span>
                      </Badge>
                      {item.isHero && (
                        <Badge className="text-xs bg-primary">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Hero
                        </Badge>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => handleEditClick(item)}
                        data-testid={`button-edit-${item.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {!item.isHero && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setHeroMutation.mutate(item.id)}
                          disabled={setHeroMutation.isPending}
                          data-testid={`button-set-hero-${item.id}`}
                        >
                          <Star className="h-4 w-4 mr-1" />
                          Set as Hero
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => setDeleteId(item.id)}
                        data-testid={`button-delete-${item.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 border-t">
                    <p className="text-sm font-medium truncate mb-2">{item.title || "Untitled Project"}</p>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href={`/admin/projects/${item.id}`}>
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Manage Media
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">No media uploaded yet.</p>
              <Button asChild>
                <label htmlFor="media-upload" className="cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Your First Media
                </label>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this media? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={editItem !== null} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Portfolio Item</DialogTitle>
            <DialogDescription>
              Add details about this project. Include a link so visitors can see your live work.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Project title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Describe what you created and the technologies used..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-url">Project URL</Label>
              <Input
                id="edit-url"
                value={editProjectUrl}
                onChange={(e) => setEditProjectUrl(e.target.value)}
                placeholder="https://example.com"
                type="url"
              />
              <p className="text-xs text-muted-foreground">
                Add a link so visitors can view the live project
              </p>
            </div>
            <div className="space-y-2">
              <Label>Display Mode</Label>
              <Select value={editDisplayMode} onValueChange={setEditDisplayMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      <span>Professional (Light)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="edge">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      <span>Edge (Dark)</span>
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
              <p className="text-xs text-muted-foreground">
                Choose which portfolio view this project appears in
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
