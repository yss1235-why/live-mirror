import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, PencilBrush, Circle, Rect, Line } from "fabric";
import { Toolbar } from "./Toolbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CanvasProps {
  sessionId: string;
  targetUrl: string;
  isHost: boolean;
  hostId: string;
}

type Tool = "select" | "pen" | "circle" | "rectangle" | "arrow" | "eraser";

export const Canvas = ({ sessionId, targetUrl, isHost, hostId }: CanvasProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [activeColor, setActiveColor] = useState("#FF00FF");
  const [annotationMode, setAnnotationMode] = useState(false); // NEW: Toggle for annotation mode
  const scrollSyncRef = useRef(false);

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      isDrawingMode: false,
      selection: isHost,
      width: window.innerWidth,
      height: window.innerHeight - 64,
    });

    // Set up drawing brush
    const brush = new PencilBrush(canvas);
    brush.color = activeColor;
    brush.width = 3;
    canvas.freeDrawingBrush = brush;

    setFabricCanvas(canvas);

    // Handle window resize
    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 64,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.dispose();
    };
  }, [isHost]);

  // Subscribe to real-time events
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`session:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "session_events",
          filter: `session_id=eq.${sessionId}`,
        },
        async (payload) => {
          const event = payload.new;
          console.log("Received event:", event);

          if (event.event_type === "scroll" && !isHost) {
            scrollSyncRef.current = true;
            if (iframeRef.current?.contentWindow) {
              try {
                iframeRef.current.contentWindow.scrollTo(
                  event.event_data.x,
                  event.event_data.y
                );
              } catch (e) {
                console.log("Cannot sync scroll (cross-origin)");
              }
            }
            setTimeout(() => {
              scrollSyncRef.current = false;
            }, 100);
          } else if (event.event_type === "annotation" && !isHost && fabricCanvas) {
            // Render annotation for viewers
            const annotationData = event.event_data;
            if (annotationData.action === "clear") {
              fabricCanvas.clear();
            } else if (annotationData.object) {
              // Add object to canvas
              const objData = annotationData.object;
              let obj;

              if (objData.type === "circle") {
                obj = new Circle({
                  left: objData.left,
                  top: objData.top,
                  radius: objData.radius,
                  fill: "transparent",
                  stroke: objData.stroke,
                  strokeWidth: objData.strokeWidth,
                });
              } else if (objData.type === "rect") {
                obj = new Rect({
                  left: objData.left,
                  top: objData.top,
                  width: objData.width,
                  height: objData.height,
                  fill: "transparent",
                  stroke: objData.stroke,
                  strokeWidth: objData.strokeWidth,
                });
              } else if (objData.type === "line") {
                obj = new Line(
                  [objData.x1, objData.y1, objData.x2, objData.y2],
                  {
                    stroke: objData.stroke,
                    strokeWidth: objData.strokeWidth,
                  }
                );
              } else if (objData.type === "path") {
                // Handle path separately using loadFromJSON
                fabricCanvas.loadFromJSON({ objects: [objData] }).then(() => {
                  fabricCanvas.renderAll();
                });
              }

              if (obj) {
                fabricCanvas.add(obj);
                fabricCanvas.renderAll();
              }
            }
          } else if (event.event_type === "navigation" && !isHost) {
            window.location.href = `/view/${sessionId}`;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, isHost, fabricCanvas]);

  // Broadcast events (host only)
  const broadcastEvent = async (eventType: string, eventData: any) => {
    if (!isHost) return;

    try {
      await supabase.from("session_events").insert({
        session_id: sessionId,
        event_type: eventType,
        event_data: eventData,
      });
    } catch (error) {
      console.error("Error broadcasting event:", error);
    }
  };

  // Handle scroll sync (host only)
  useEffect(() => {
    if (!isHost || !iframeRef.current) return;

    const handleScroll = () => {
      if (scrollSyncRef.current) return;

      try {
        const iframe = iframeRef.current?.contentWindow;
        if (iframe) {
          broadcastEvent("scroll", {
            x: iframe.scrollX,
            y: iframe.scrollY,
          });
        }
      } catch (e) {
        console.log("Cannot access iframe scroll (cross-origin)");
      }
    };

    const iframe = iframeRef.current;
    try {
      iframe.contentWindow?.addEventListener("scroll", handleScroll);
    } catch (e) {
      console.log("Cannot attach scroll listener (cross-origin)");
    }

    return () => {
      try {
        iframe.contentWindow?.removeEventListener("scroll", handleScroll);
      } catch (e) {
        // Ignore
      }
    };
  }, [isHost]);

  // Update tool behavior
  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === "pen" && annotationMode;
    
    if (activeTool === "pen" && annotationMode) {
      const brush = fabricCanvas.freeDrawingBrush as PencilBrush;
      brush.color = activeColor;
      brush.width = 3;
    }

    // Add event listeners for object creation
    if (isHost && annotationMode) {
      fabricCanvas.off("path:created");
      fabricCanvas.on("path:created", (e: any) => {
        const path = e.path;
        broadcastEvent("annotation", {
          action: "add",
          object: path.toJSON(),
        });
      });
    }
  }, [activeTool, activeColor, fabricCanvas, isHost, annotationMode]);

  const handleToolClick = (tool: Tool) => {
    if (!isHost) return;
    
    // Enable annotation mode when selecting a tool
    if (!annotationMode) {
      setAnnotationMode(true);
      toast.info("Annotation mode enabled");
    }
    
    setActiveTool(tool);

    if (tool === "circle" && fabricCanvas) {
      const circle = new Circle({
        left: 100,
        top: 100,
        radius: 50,
        fill: "transparent",
        stroke: activeColor,
        strokeWidth: 3,
      });
      fabricCanvas.add(circle);
      broadcastEvent("annotation", {
        action: "add",
        object: circle.toJSON(),
      });
    } else if (tool === "rectangle" && fabricCanvas) {
      const rect = new Rect({
        left: 100,
        top: 100,
        width: 100,
        height: 100,
        fill: "transparent",
        stroke: activeColor,
        strokeWidth: 3,
      });
      fabricCanvas.add(rect);
      broadcastEvent("annotation", {
        action: "add",
        object: rect.toJSON(),
      });
    } else if (tool === "arrow" && fabricCanvas) {
      const arrow = new Line([100, 100, 200, 200], {
        stroke: activeColor,
        strokeWidth: 3,
      });
      fabricCanvas.add(arrow);
      broadcastEvent("annotation", {
        action: "add",
        object: arrow.toJSON(),
      });
    }
  };

  const handleClear = () => {
    if (!isHost || !fabricCanvas) return;
    fabricCanvas.clear();
    broadcastEvent("annotation", {
      action: "clear",
    });
    toast.success("Annotations cleared");
  };

  // NEW: Toggle annotation mode
  const toggleAnnotationMode = () => {
    setAnnotationMode(!annotationMode);
    if (annotationMode) {
      setActiveTool("select");
      toast.info("Annotation mode disabled - You can now interact with the website");
    } else {
      toast.info("Annotation mode enabled - Click a tool to annotate");
    }
  };

  return (
    <div className="relative w-full" style={{ height: "calc(100vh - 64px)" }}>
      <iframe
        ref={iframeRef}
        src={targetUrl}
        className="absolute inset-0 w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        title="Shared Browser"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ 
          zIndex: 10, 
          pointerEvents: (isHost && annotationMode) ? "auto" : "none" // KEY FIX!
        }}
      />
      {isHost && (
        <>
          {/* NEW: Annotation mode toggle button */}
          <button
            onClick={toggleAnnotationMode}
            className={`absolute top-4 right-4 z-20 px-4 py-2 rounded-lg font-medium transition-all ${
              annotationMode
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {annotationMode ? "🎨 Annotation Mode ON" : "🖱️ Browse Mode"}
          </button>
          
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <Toolbar
              activeTool={activeTool}
              onToolClick={handleToolClick}
              onClear={handleClear}
              activeColor={activeColor}
              onColorChange={setActiveColor}
            />
          </div>
        </>
      )}
    </div>
  );
};
