import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
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
  Plus, 
  Trash2, 
  ImageIcon, 
  Film, 
  Loader2, 
  ArrowLeft, 
  Music,
  Pencil,
  ExternalLink
} from "lucide-react";
import type { GalleryItem, PortfolioMedia } from "@shared/schema";

export default function AdminProjectMedia() {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editMedia, setEditMedia] = useState<PortfolioMedia | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const { data: project, isLoading: projectLoading } = useQuery<GalleryItem>({
    queryKey: [`/api/gallery/${projectId}`],
    enabled: !!projectId,
  });

  const { data: media, isLoading: mediaLoading } = useQuery<PortfolioMedia[]>({
    queryKey: [`/api/projects/${projectId}/media`],
    enabled: !!projectId,
  });

  const { uploadFile, isUploading } = useUpload({
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
      return apiRequest("POST", `/api/projects/${projectId}/media`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/media`] });
      toast({ title: "Media added successfully" });
    },
    onError: () => {
      toast({
        title: "Failed to add media",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; title?: string }) => {
      const { id, ...updateData } = data;
      return apiRequest("PUT", `/api/projects/${projectId}/media/${id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/media`] });
      toast({ title: "Media updated" });
      setEditMedia(null);
    },
    onError: () => {
      toast({
        title: "Failed to update media",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/projects/${projectId}/media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/media`] });
      toast({ title: "Media deleted" });
      setDeleteId(null);
    },
    onError: () => {
      toast({
        title: "Failed to delete media",
        variant: "destructive",
      });
    },
  });

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
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "audio/mp3",
        "audio/aac",
      ];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image, video, or audio file",
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
    if (contentType.startsWith("audio/")) return "audio";
    return "image";
  };

  const getMediaIcon = (type: string) => {
    if (type === "video") return <Film className="h-3 w-3" />;
    if (type === "audio") return <Music className="h-3 w-3" />;
    return <ImageIcon className="h-3 w-3" />;
  };

  const renderMedia = (item: PortfolioMedia) => {
    if (item.mediaType === "video") {
      return (
        <video
          src={item.mediaUrl}
          className="w-full h-full object-cover"
          muted
          loop
          playsInline
          onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
          onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
        />
      );
    }
    if (item.mediaType === "audio") {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 p-4">
          <Music className="h-12 w-12 text-primary mb-2" />
          <p className="text-sm text-center truncate w-full">{item.title || "Audio file"}</p>
          <audio src={item.mediaUrl} controls className="w-full mt-2" />
        </div>
      );
    }
    return (
      <img
        src={item.mediaUrl}
        alt={item.title || "Media"}
        className="w-full h-full object-cover"
      />
    );
  };

  const handleEditClick = (item: PortfolioMedia) => {
    setEditMedia(item);
    setEditTitle(item.title || "");
  };

  const handleEditSave = () => {
    if (!editMedia) return;
    updateMutation.mutate({
      id: editMedia.id,
      title: editTitle || undefined,
    });
  };

  if (projectLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Project not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/admin/gallery">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portfolio
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/gallery">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Link>
              </Button>
            </div>
            <h1 className="font-serif text-3xl font-normal">
              {project.title || "Untitled Project"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Add images, videos, and audio files to showcase this project
            </p>
            {project.projectUrl && (
              <a 
                href={project.projectUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1 mt-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Live Project
              </a>
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*,video/*,audio/*"
              className="hidden"
              onChange={handleFileChange}
              id="media-upload"
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
                    Add Media
                  </>
                )}
              </label>
            </Button>
          </div>
        </div>

        {mediaLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-md" />
            ))}
          </div>
        ) : media && media.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item) => (
              <Card key={item.id} className="overflow-hidden group relative">
                <CardContent className="p-0">
                  <div className="aspect-square relative overflow-hidden">
                    {renderMedia(item)}
                    <div className="absolute top-2 left-2 flex gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {getMediaIcon(item.mediaType)}
                        <span className="ml-1 capitalize">{item.mediaType}</span>
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => handleEditClick(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => setDeleteId(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {item.title && (
                    <div className="p-2 border-t">
                      <p className="text-sm truncate">{item.title}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">No media added yet.</p>
              <Button asChild>
                <label htmlFor="media-upload" className="cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Media
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={editMedia !== null} onOpenChange={(open) => !open && setEditMedia(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Media</DialogTitle>
            <DialogDescription>
              Update the title for this media file.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Media title"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMedia(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
