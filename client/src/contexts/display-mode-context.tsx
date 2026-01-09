import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DisplayModeSettings } from "@shared/schema";
import { AVAILABLE_FONTS } from "@shared/schema";

type DisplayMode = "professional" | "edge";

interface FontInfo {
  name: string;
  family: string;
  style: string;
  isCustom?: boolean;
  fontUrl?: string;
}

interface AvailableFontsData {
  headings: FontInfo[];
  body: FontInfo[];
}

interface DisplayModeContextType {
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  toggleDisplayMode: () => void;
  modeSettings: DisplayModeSettings | null;
  isLoadingSettings: boolean;
}

const DisplayModeContext = createContext<DisplayModeContextType | undefined>(undefined);

function hexToHSL(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0 0% 0%";

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function loadGoogleFont(fontName: string) {
  const fontId = `google-font-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(fontId)) return;

  const link = document.createElement("link");
  link.id = fontId;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

function loadCustomFont(fontName: string, fontUrl: string) {
  const fontId = `custom-font-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(fontId)) return;

  const style = document.createElement("style");
  style.id = fontId;
  style.textContent = `
    @font-face {
      font-family: '${fontName}';
      src: url('${fontUrl}') format('woff2'), url('${fontUrl}') format('woff'), url('${fontUrl}') format('truetype');
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
}

export function DisplayModeProvider({ children }: { children: ReactNode }) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("displayMode");
      if (saved === "professional" || saved === "edge") {
        return saved;
      }
    }
    return "professional";
  });

  useEffect(() => {
    localStorage.setItem("displayMode", displayMode);
  }, [displayMode]);

  const { data: allSettings, isLoading: isLoadingSettings } = useQuery<DisplayModeSettings[]>({
    queryKey: ["/api/display-mode-settings"],
    staleTime: 1000 * 60 * 5,
  });

  const { data: availableFonts } = useQuery<AvailableFontsData>({
    queryKey: ["/api/available-fonts"],
    staleTime: 1000 * 60 * 5,
  });

  const modeSettings = allSettings?.find(s => s.mode === displayMode) || null;

  const loadFont = (fontName: string) => {
    if (!availableFonts) return;
    
    const allFonts = [...availableFonts.headings, ...availableFonts.body];
    const font = allFonts.find(f => f.name === fontName);
    
    if (font?.isCustom && font?.fontUrl) {
      loadCustomFont(fontName, font.fontUrl);
    } else {
      loadGoogleFont(fontName);
    }
  };

  const getFontFamily = (fontName: string): string => {
    if (!availableFonts) {
      const allBuiltInFonts = [...AVAILABLE_FONTS.headings, ...AVAILABLE_FONTS.body];
      const font = allBuiltInFonts.find(f => f.name === fontName);
      return font?.family || `'${fontName}', sans-serif`;
    }
    
    const allFonts = [...availableFonts.headings, ...availableFonts.body];
    const font = allFonts.find(f => f.name === fontName);
    return font?.family || `'${fontName}', sans-serif`;
  };

  useEffect(() => {
    if (!modeSettings) return;

    if (modeSettings.headingFont) {
      loadFont(modeSettings.headingFont);
    }
    if (modeSettings.bodyFont) {
      loadFont(modeSettings.bodyFont);
    }

    const root = document.documentElement;
    
    if (modeSettings.backgroundColor) {
      root.style.setProperty("--mode-background", modeSettings.backgroundColor);
      root.style.setProperty("--background", hexToHSL(modeSettings.backgroundColor));
    }
    if (modeSettings.surfaceColor) {
      root.style.setProperty("--mode-surface", modeSettings.surfaceColor);
      root.style.setProperty("--card", hexToHSL(modeSettings.surfaceColor));
    }
    if (modeSettings.accentColor) {
      root.style.setProperty("--mode-accent", modeSettings.accentColor);
      root.style.setProperty("--primary", hexToHSL(modeSettings.accentColor));
      root.style.setProperty("--ring", hexToHSL(modeSettings.accentColor));
    }
    if (modeSettings.textColor) {
      root.style.setProperty("--mode-text", modeSettings.textColor);
      root.style.setProperty("--foreground", hexToHSL(modeSettings.textColor));
      root.style.setProperty("--card-foreground", hexToHSL(modeSettings.textColor));
    }

    if (modeSettings.headingFont) {
      root.style.setProperty("--font-serif", getFontFamily(modeSettings.headingFont));
    }
    if (modeSettings.bodyFont) {
      root.style.setProperty("--font-sans", getFontFamily(modeSettings.bodyFont));
    }

    if (displayMode === "edge") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }

    return () => {
      root.style.removeProperty("--mode-background");
      root.style.removeProperty("--mode-surface");
      root.style.removeProperty("--mode-accent");
      root.style.removeProperty("--mode-text");
    };
  }, [modeSettings, displayMode, availableFonts]);

  const toggleDisplayMode = () => {
    setDisplayMode((prev) => (prev === "professional" ? "edge" : "professional"));
  };

  return (
    <DisplayModeContext.Provider value={{ 
      displayMode, 
      setDisplayMode, 
      toggleDisplayMode,
      modeSettings,
      isLoadingSettings 
    }}>
      {children}
    </DisplayModeContext.Provider>
  );
}

export function useDisplayMode() {
  const context = useContext(DisplayModeContext);
  if (!context) {
    throw new Error("useDisplayMode must be used within a DisplayModeProvider");
  }
  return context;
}
