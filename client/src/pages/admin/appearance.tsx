import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Palette, Sun, Moon, Type, Image } from "lucide-react";
import type { DisplayModeSettings, GalleryItem } from "@shared/schema";

interface AvailableFonts {
  headings: { name: string; family: string; style: string }[];
  body: { name: string; family: string; style: string }[];
}

export default function AdminAppearance() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"professional" | "edge">("professional");

  const { data: allSettings, isLoading: settingsLoading } = useQuery<DisplayModeSettings[]>({
    queryKey: ["/api/display-mode-settings"],
  });

  const { data: galleryItems, isLoading: galleryLoading } = useQuery<GalleryItem[]>({
    queryKey: ["/api/gallery"],
  });

  const { data: availableFonts } = useQuery<AvailableFonts>({
    queryKey: ["/api/available-fonts"],
  });

  const professionalSettings = allSettings?.find(s => s.mode === "professional");
  const edgeSettings = allSettings?.find(s => s.mode === "edge");

  const updateMutation = useMutation({
    mutationFn: async ({ mode, settings }: { mode: string; settings: Partial<DisplayModeSettings> }) => {
      const res = await apiRequest("PUT", `/api/display-mode-settings/${mode}`, settings);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/display-mode-settings"] });
      toast({ title: "Success", description: "Appearance settings saved!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (settingsLoading || galleryLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-normal mb-2 flex items-center gap-2">
          <Palette className="h-8 w-8 text-primary" />
          Yin/Yang Appearance
        </h1>
        <p className="text-muted-foreground">
          Customize the look and feel for each display mode. Yin (☀️) is the light, professional theme.
          Yang (🌙) is the dark, edgy theme.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "professional" | "edge")}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="professional" className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Yin (Light)
          </TabsTrigger>
          <TabsTrigger value="edge" className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            Yang (Dark)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="professional" className="mt-6">
          <ModeSettingsForm
            mode="professional"
            settings={professionalSettings}
            galleryItems={galleryItems || []}
            availableFonts={availableFonts}
            onSave={(settings) => updateMutation.mutate({ mode: "professional", settings })}
            isPending={updateMutation.isPending}
            defaultColors={{
              backgroundColor: "#ffffff",
              surfaceColor: "#f8f9fa",
              accentColor: "#8B7355",
              textColor: "#1a1a1a",
            }}
          />
        </TabsContent>

        <TabsContent value="edge" className="mt-6">
          <ModeSettingsForm
            mode="edge"
            settings={edgeSettings}
            galleryItems={galleryItems || []}
            availableFonts={availableFonts}
            onSave={(settings) => updateMutation.mutate({ mode: "edge", settings })}
            isPending={updateMutation.isPending}
            defaultColors={{
              backgroundColor: "#0a0a0a",
              surfaceColor: "#1a1a1a",
              accentColor: "#C9A961",
              textColor: "#ffffff",
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ModeSettingsFormProps {
  mode: "professional" | "edge";
  settings?: DisplayModeSettings;
  galleryItems: GalleryItem[];
  availableFonts?: AvailableFonts;
  onSave: (settings: Partial<DisplayModeSettings>) => void;
  isPending: boolean;
  defaultColors: {
    backgroundColor: string;
    surfaceColor: string;
    accentColor: string;
    textColor: string;
  };
}

function ModeSettingsForm({
  mode,
  settings,
  galleryItems,
  availableFonts,
  onSave,
  isPending,
  defaultColors,
}: ModeSettingsFormProps) {
  const [heroItemId, setHeroItemId] = useState<number | null>(settings?.heroItemId || null);
  const [headingFont, setHeadingFont] = useState(settings?.headingFont || "Cormorant Garamond");
  const [bodyFont, setBodyFont] = useState(settings?.bodyFont || "Inter");
  const [backgroundColor, setBackgroundColor] = useState(settings?.backgroundColor || defaultColors.backgroundColor);
  const [surfaceColor, setSurfaceColor] = useState(settings?.surfaceColor || defaultColors.surfaceColor);
  const [accentColor, setAccentColor] = useState(settings?.accentColor || defaultColors.accentColor);
  const [textColor, setTextColor] = useState(settings?.textColor || defaultColors.textColor);
  const [tagline, setTagline] = useState(settings?.tagline || "");

  useEffect(() => {
    if (settings) {
      setHeroItemId(settings.heroItemId);
      setHeadingFont(settings.headingFont || "Cormorant Garamond");
      setBodyFont(settings.bodyFont || "Inter");
      setBackgroundColor(settings.backgroundColor || defaultColors.backgroundColor);
      setSurfaceColor(settings.surfaceColor || defaultColors.surfaceColor);
      setAccentColor(settings.accentColor || defaultColors.accentColor);
      setTextColor(settings.textColor || defaultColors.textColor);
      setTagline(settings.tagline || "");
    }
  }, [settings, defaultColors]);

  const handleSave = () => {
    onSave({
      heroItemId,
      headingFont,
      bodyFont,
      backgroundColor,
      surfaceColor,
      accentColor,
      textColor,
      tagline,
    });
  };

  const modeLabel = mode === "professional" ? "Yin" : "Yang";
  const imageItems = galleryItems.filter(item => item.mediaType === "image");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            <CardTitle className="font-serif text-lg">Hero Image</CardTitle>
          </div>
          <CardDescription>
            Select a portfolio image to display as the hero for {modeLabel} mode.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select
              value={heroItemId?.toString() || "none"}
              onValueChange={(value) => setHeroItemId(value === "none" ? null : parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a hero image" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No hero image</SelectItem>
                {imageItems.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.title || `Image #${item.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {heroItemId && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                <img
                  src={imageItems.find(i => i.id === heroItemId)?.mediaUrl}
                  alt="Hero preview"
                  className="w-full max-w-md h-48 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Type className="h-5 w-5 text-primary" />
            <CardTitle className="font-serif text-lg">Typography</CardTitle>
          </div>
          <CardDescription>
            Choose fonts for headings and body text in {modeLabel} mode.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Heading Font</Label>
              <Select value={headingFont} onValueChange={setHeadingFont}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableFonts?.headings.map((font) => (
                    <SelectItem key={font.name} value={font.name}>
                      <span style={{ fontFamily: font.family }}>{font.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">({font.style})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Body Font</Label>
              <Select value={bodyFont} onValueChange={setBodyFont}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableFonts?.body.map((font) => (
                    <SelectItem key={font.name} value={font.name}>
                      <span style={{ fontFamily: font.family }}>{font.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">({font.style})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-4 rounded-lg border mt-4" style={{ backgroundColor: surfaceColor }}>
            <p className="text-sm text-muted-foreground mb-2">Preview:</p>
            <h3
              className="text-2xl mb-2"
              style={{
                fontFamily: availableFonts?.headings.find(f => f.name === headingFont)?.family || headingFont,
                color: textColor,
              }}
            >
              {modeLabel} Mode Heading
            </h3>
            <p
              style={{
                fontFamily: availableFonts?.body.find(f => f.name === bodyFont)?.family || bodyFont,
                color: textColor,
              }}
            >
              This is how body text will appear in {modeLabel} mode.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle className="font-serif text-lg">Colors</CardTitle>
          </div>
          <CardDescription>
            Customize the color scheme for {modeLabel} mode.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Background</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-10 h-10 rounded border cursor-pointer"
                />
                <Input
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Surface</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={surfaceColor}
                  onChange={(e) => setSurfaceColor(e.target.value)}
                  className="w-10 h-10 rounded border cursor-pointer"
                />
                <Input
                  value={surfaceColor}
                  onChange={(e) => setSurfaceColor(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Accent</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-10 rounded border cursor-pointer"
                />
                <Input
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Text</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-10 h-10 rounded border cursor-pointer"
                />
                <Input
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div
            className="p-6 rounded-lg mt-4 border"
            style={{ backgroundColor }}
          >
            <p className="text-sm mb-4" style={{ color: textColor, opacity: 0.7 }}>Color Preview:</p>
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: surfaceColor }}
            >
              <h4 className="text-lg font-semibold mb-2" style={{ color: textColor }}>
                Surface Element
              </h4>
              <p style={{ color: textColor }}>
                Text content with <span style={{ color: accentColor }}>accent color</span> highlights.
              </p>
              <button
                className="mt-3 px-4 py-2 rounded text-white font-medium"
                style={{ backgroundColor: accentColor }}
              >
                Accent Button
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Mode Tagline</CardTitle>
          <CardDescription>
            Optional tagline specific to {modeLabel} mode, displayed on the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={mode === "professional"
              ? "Crafting professional solutions for your brand..."
              : "Bold ideas. Fearless execution."
            }
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="resize-none"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" disabled={isPending}>
          {isPending ? "Saving..." : `Save ${modeLabel} Settings`}
        </Button>
      </div>
    </div>
  );
}
