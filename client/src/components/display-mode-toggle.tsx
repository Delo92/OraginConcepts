import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useDisplayMode } from "@/contexts/display-mode-context";

export function DisplayModeToggle() {
  const { displayMode, toggleDisplayMode } = useDisplayMode();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDisplayMode}
      className="relative overflow-hidden"
      title={displayMode === "professional" ? "Switch to Edge view" : "Switch to Professional view"}
    >
      <div className="absolute inset-0 rounded-md animate-pulse-ring" />
      {displayMode === "professional" ? (
        <Sun className="h-5 w-5 text-amber-600 transition-transform hover:rotate-12" />
      ) : (
        <Moon className="h-5 w-5 text-slate-400 transition-transform hover:-rotate-12" />
      )}
      <span className="sr-only">Toggle display mode</span>
    </Button>
  );
}
