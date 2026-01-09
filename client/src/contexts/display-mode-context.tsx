import { createContext, useContext, useState, ReactNode } from "react";

type DisplayMode = "professional" | "edge";

interface DisplayModeContextType {
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  toggleDisplayMode: () => void;
}

const DisplayModeContext = createContext<DisplayModeContextType | undefined>(undefined);

export function DisplayModeProvider({ children }: { children: ReactNode }) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>("professional");

  const toggleDisplayMode = () => {
    setDisplayMode((prev) => (prev === "professional" ? "edge" : "professional"));
  };

  return (
    <DisplayModeContext.Provider value={{ displayMode, setDisplayMode, toggleDisplayMode }}>
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
