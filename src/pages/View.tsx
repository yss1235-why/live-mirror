import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Canvas } from "@/components/annotation/Canvas";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, Loader2 } from "lucide-react";

export default function View() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    const loadSession = async () => {
      try {
        const { data, error } = await supabase
          .from("sessions")
          .select("*")
          .eq("id", sessionId)
          .eq("active", true)
          .single();

        if (error) throw error;

        if (!data) {
          toast.error("Session not found or has ended");
          setLoading(false);
          return;
        }

        setSession(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading session:", error);
        toast.error("Failed to load session");
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="glass-panel p-8 max-w-md text-center space-y-4">
          <div className="inline-block p-3 rounded-2xl bg-destructive/20 mb-4">
            <Eye className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Session Not Found</h1>
          <p className="text-muted-foreground">
            This session doesn't exist or has ended.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-panel border-b border-border/50 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/20 border border-accent/30">
              <Eye className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Viewing Session</span>
            </div>
            <span className="text-sm text-muted-foreground">{session.url}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium">Live</span>
          </div>
        </div>
      </header>

      <Canvas
        sessionId={sessionId!}
        targetUrl={session.url}
        isHost={false}
        hostId={session.host_id}
      />
    </div>
  );
}
