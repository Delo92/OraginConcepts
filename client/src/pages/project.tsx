import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  ExternalLink, 
  X, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Volume2,
  Music
} from "lucide-react";
import type { GalleryItem, PortfolioMedia } from "@shared/schema";

function AudioPlayer({ audioFiles }: { audioFiles: PortfolioMedia[] }) {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentAudio = audioFiles[currentTrack];

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setProgress(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setProgress(time);
  };

  const nextTrack = () => {
    const next = (currentTrack + 1) % audioFiles.length;
    setCurrentTrack(next);
    setIsPlaying(false);
    setProgress(0);
  };

  const prevTrack = () => {
    const prev = currentTrack === 0 ? audioFiles.length - 1 : currentTrack - 1;
    setCurrentTrack(prev);
    setIsPlaying(false);
    setProgress(0);
  };

  const handleEnded = () => {
    if (currentTrack < audioFiles.length - 1) {
      nextTrack();
      setTimeout(() => {
        audioRef.current?.play();
        setIsPlaying(true);
      }, 100);
    } else {
      setIsPlaying(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (audioFiles.length === 0) return null;

  return (
    <div className="bg-card border rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0">
          <Music className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{currentAudio?.title || `Track ${currentTrack + 1}`}</h3>
          <p className="text-sm text-muted-foreground">
            {currentTrack + 1} of {audioFiles.length} tracks
          </p>
        </div>
        <Volume2 className="h-5 w-5 text-muted-foreground" />
      </div>

      <audio
        ref={audioRef}
        src={currentAudio?.mediaUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div className="space-y-2">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={progress}
          onChange={handleSeek}
          className="w-full h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevTrack}
          disabled={audioFiles.length <= 1}
        >
          <SkipBack className="h-5 w-5" />
        </Button>
        <Button
          variant="default"
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 ml-1" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextTrack}
          disabled={audioFiles.length <= 1}
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      {audioFiles.length > 1 && (
        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-medium mb-2">All Tracks</h4>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {audioFiles.map((file, index) => (
              <button
                key={file.id}
                onClick={() => {
                  setCurrentTrack(index);
                  setIsPlaying(false);
                  setProgress(0);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  currentTrack === index 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted'
                }`}
              >
                <span className="mr-2">{index + 1}.</span>
                {file.title || `Track ${index + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Project() {
  const { projectId } = useParams<{ projectId: string }>();
  const [selectedMedia, setSelectedMedia] = useState<PortfolioMedia | null>(null);

  const { data: project, isLoading: projectLoading } = useQuery<GalleryItem>({
    queryKey: [`/api/gallery/${projectId}`],
    enabled: !!projectId,
  });

  const { data: media, isLoading: mediaLoading } = useQuery<PortfolioMedia[]>({
    queryKey: [`/api/projects/${projectId}/media`],
    enabled: !!projectId,
  });

  const images = media?.filter(m => m.mediaType === 'image' || m.mediaType === 'gif') || [];
  const videos = media?.filter(m => m.mediaType === 'video') || [];
  const audio = media?.filter(m => m.mediaType === 'audio') || [];

  const renderMedia = (item: PortfolioMedia) => {
    if (item.mediaType === 'video') {
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
    return (
      <img
        src={item.mediaUrl}
        alt={item.title || "Media"}
        className="w-full h-full object-cover"
      />
    );
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-8" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-serif text-3xl mb-4">Project Not Found</h1>
            <p className="text-muted-foreground mb-8">The project you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/gallery">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portfolio
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/gallery">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portfolio
            </Link>
          </Button>

          <div className="mb-8">
            {project.mediaUrl && (
              <div className="aspect-video rounded-lg overflow-hidden mb-6">
                {project.mediaType === 'video' ? (
                  <video
                    src={project.mediaUrl}
                    className="w-full h-full object-cover"
                    controls
                    playsInline
                  />
                ) : (
                  <img
                    src={project.mediaUrl}
                    alt={project.title || "Project"}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}

            <h1 className="font-serif text-3xl md:text-4xl font-normal mb-4">
              {project.title || "Untitled Project"}
            </h1>

            {project.description && (
              <p className="text-muted-foreground text-lg whitespace-pre-wrap mb-6">
                {project.description}
              </p>
            )}

            {project.projectUrl && (
              <Button asChild size="lg">
                <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  View Live Project
                </a>
              </Button>
            )}
          </div>

          {audio.length > 0 && (
            <div className="mb-8">
              <h2 className="font-serif text-2xl font-normal mb-4">Music & Audio</h2>
              <AudioPlayer audioFiles={audio} />
            </div>
          )}

          {videos.length > 0 && (
            <div className="mb-8">
              <h2 className="font-serif text-2xl font-normal mb-4">Videos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videos.map((video) => (
                  <Card 
                    key={video.id} 
                    className="overflow-hidden cursor-pointer hover:ring-2 ring-primary transition-all"
                    onClick={() => setSelectedMedia(video)}
                  >
                    <div className="aspect-video overflow-hidden">
                      <video
                        src={video.mediaUrl}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                        onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                      />
                    </div>
                    {video.title && (
                      <div className="p-3">
                        <p className="text-sm font-medium truncate">{video.title}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {images.length > 0 && (
            <div className="mb-8">
              <h2 className="font-serif text-2xl font-normal mb-4">Images</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.map((image) => (
                  <Card 
                    key={image.id} 
                    className="overflow-hidden cursor-pointer hover:ring-2 ring-primary transition-all"
                    onClick={() => setSelectedMedia(image)}
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={image.mediaUrl}
                        alt={image.title || "Image"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!mediaLoading && media && media.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No additional media for this project.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <Dialog open={!!selectedMedia} onOpenChange={(open) => !open && setSelectedMedia(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95">
          <button
            onClick={() => setSelectedMedia(null)}
            className="absolute top-4 right-4 z-10 text-white/80 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center justify-center min-h-[50vh] p-4">
              {selectedMedia && (
                selectedMedia.mediaType === 'video' ? (
                  <video
                    src={selectedMedia.mediaUrl}
                    className="max-h-[70vh] max-w-full object-contain"
                    controls
                    autoPlay
                  />
                ) : (
                  <img
                    src={selectedMedia.mediaUrl}
                    alt={selectedMedia.title || "Media"}
                    className="max-h-[70vh] max-w-full object-contain"
                  />
                )
              )}
            </div>
            {selectedMedia?.title && (
              <div className="bg-black/80 p-4 text-white text-center">
                <p className="font-medium">{selectedMedia.title}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
