import { Button } from "@/components/ui/button";
import {
  Pencil,
  Circle,
  Square,
  ArrowRight,
  Eraser,
  Trash2,
  MousePointer,
} from "lucide-react";

interface ToolbarProps {
  activeTool: string;
  onToolClick: (tool: any) => void;
  onClear: () => void;
  activeColor: string;
  onColorChange: (color: string) => void;
}

const colors = ["#FF00FF", "#00FFFF", "#FFFF00", "#FF0000", "#00FF00", "#FFFFFF"];

export const Toolbar = ({
  activeTool,
  onToolClick,
  onClear,
  activeColor,
  onColorChange,
}: ToolbarProps) => {
  return (
    <div className="glass-panel rounded-2xl p-3 shadow-glow flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Button
          variant={activeTool === "select" ? "default" : "ghost"}
          size="icon"
          onClick={() => onToolClick("select")}
          className="h-10 w-10 transition-smooth"
        >
          <MousePointer className="w-5 h-5" />
        </Button>
        <Button
          variant={activeTool === "pen" ? "default" : "ghost"}
          size="icon"
          onClick={() => onToolClick("pen")}
          className="h-10 w-10 transition-smooth"
        >
          <Pencil className="w-5 h-5" />
        </Button>
        <Button
          variant={activeTool === "circle" ? "default" : "ghost"}
          size="icon"
          onClick={() => onToolClick("circle")}
          className="h-10 w-10 transition-smooth"
        >
          <Circle className="w-5 h-5" />
        </Button>
        <Button
          variant={activeTool === "rectangle" ? "default" : "ghost"}
          size="icon"
          onClick={() => onToolClick("rectangle")}
          className="h-10 w-10 transition-smooth"
        >
          <Square className="w-5 h-5" />
        </Button>
        <Button
          variant={activeTool === "arrow" ? "default" : "ghost"}
          size="icon"
          onClick={() => onToolClick("arrow")}
          className="h-10 w-10 transition-smooth"
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <Button
          variant={activeTool === "eraser" ? "default" : "ghost"}
          size="icon"
          onClick={() => onToolClick("eraser")}
          className="h-10 w-10 transition-smooth"
        >
          <Eraser className="w-5 h-5" />
        </Button>
      </div>

      <div className="w-px h-8 bg-border/50" />

      <div className="flex items-center gap-2">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={`w-8 h-8 rounded-lg transition-smooth ${
              activeColor === color
                ? "ring-2 ring-accent ring-offset-2 ring-offset-background scale-110"
                : "hover:scale-105"
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      <div className="w-px h-8 bg-border/50" />

      <Button
        variant="ghost"
        size="icon"
        onClick={onClear}
        className="h-10 w-10 transition-smooth hover:bg-destructive/20 hover:text-destructive"
      >
        <Trash2 className="w-5 h-5" />
      </Button>
    </div>
  );
};
