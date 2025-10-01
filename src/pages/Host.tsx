import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Canvas } from "@/components/annotation/Canvas";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Share2, Video } from "lucide-react";

export default function Host() {
  const [url, setUrl] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState<string | null>(null);
  const [hostId] = useState(() => crypto.randomUUID());
  const navigate = useNavigate();

  const createSession = async () => {
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("sessions")
        .insert({
          url: url.startsWith("http") ? url : `https://${url}`,
          host_id: hostId,
          active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      setTargetUrl(data.url);
      toast.success("Session created! Share the link with viewers.");
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Failed to create session");
    }
  };

  const copyShareLink = () => {
    if (!sessionId) return;
    const link = `${window.location.origin}/view/${sessionId}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  if (sessionId && targetUrl) {
    return (
      <div className="min-h-screen bg-background">
        <header className="glass-panel border-b border-border/50 p-4 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/20 border border-accent/30">
                <Video className="w-4 h-4 text-accent animate-pulse" />
                <span className="text-sm font-medium">Live Session</span>
              </div>
              <span className="text-sm text-muted-foreground">{targetUrl}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={copyShareLink} variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button onClick={() => navigate("/")} variant="secondary" size="sm">
                End Session
              </Button>
            </div>
          </div>
        </header>

        <Canvas sessionId={sessionId} targetUrl={targetUrl} isHost={true} hostId={hostId} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="glass-panel p-8 max-w-2xl w-full space-y-6">
        <div className="space-y-2 text-center">
          <div className="inline-block p-3 rounded-2xl gradient-primary shadow-glow mb-4">
            <Share2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent">
            Start Live Session
          </h1>
          <p className="text-muted-foreground">
            Enter a website URL to share your browsing experience in real-time
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Enter website URL (e.g., example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && createSession()}
              className="h-12 text-lg glass-panel"
            />
          </div>

          <Button
            onClick={createSession}
            className="w-full h-12 text-lg gradient-primary shadow-glow hover:scale-105 transition-smooth"
          >
            Create Session
          </Button>
        </div>

        <div className="pt-6 space-y-3 text-sm text-muted-foreground border-t border-border/50">
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            Share your screen with view-only access
          </p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            Draw annotations in real-time
          </p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            Synchronized scrolling and navigation
          </p>
        </div>
      </Card>
    </div>
  );
}
