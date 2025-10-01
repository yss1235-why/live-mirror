import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Share2, Eye, Pencil, Video, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-20" />
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)",
          backgroundSize: "40px 40px"
        }} />
        
        <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="inline-block p-4 rounded-3xl gradient-primary shadow-glow mb-8 animate-pulse">
            <Video className="w-16 h-16 text-white" />
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 gradient-primary bg-clip-text text-transparent">
            LiveSync Studio
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Share your web browsing experience in real-time with live annotations.
            Perfect for demos, teaching, and collaborative viewing.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/host")}
              size="lg"
              className="h-14 px-8 text-lg gradient-primary shadow-glow hover:scale-105 transition-smooth"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Start Hosting
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="glass-panel p-8 text-center space-y-4 transition-smooth hover:scale-105">
            <div className="inline-block p-4 rounded-2xl gradient-accent shadow-glow">
              <Share2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold">Real-Time Sharing</h3>
            <p className="text-muted-foreground">
              Share any website with viewers instantly. They see exactly what you see, synchronized in real-time.
            </p>
          </Card>

          <Card className="glass-panel p-8 text-center space-y-4 transition-smooth hover:scale-105">
            <div className="inline-block p-4 rounded-2xl gradient-accent shadow-glow">
              <Pencil className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold">Live Annotations</h3>
            <p className="text-muted-foreground">
              Draw, highlight, and annotate directly on the page. All annotations appear live for viewers.
            </p>
          </Card>

          <Card className="glass-panel p-8 text-center space-y-4 transition-smooth hover:scale-105">
            <div className="inline-block p-4 rounded-2xl gradient-accent shadow-glow">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold">View-Only Mode</h3>
            <p className="text-muted-foreground">
              Viewers can watch but not interact. Perfect for presentations, demos, and training sessions.
            </p>
          </Card>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-4xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center mb-16 gradient-primary bg-clip-text text-transparent">
          How It Works
        </h2>
        
        <div className="space-y-8">
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
              1
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Enter URL</h3>
              <p className="text-muted-foreground">
                Enter any website URL you want to share with others.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
              2
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Share Link</h3>
              <p className="text-muted-foreground">
                Get a unique shareable link and send it to your viewers.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
              3
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Start Presenting</h3>
              <p className="text-muted-foreground">
                Browse and annotate. Everything syncs live to all viewers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <Card className="glass-panel p-12 space-y-6">
          <Zap className="w-16 h-16 mx-auto gradient-primary bg-clip-text text-primary" />
          <h2 className="text-3xl font-bold">Ready to Start?</h2>
          <p className="text-muted-foreground text-lg">
            Create your first live browsing session in seconds
          </p>
          <Button
            onClick={() => navigate("/host")}
            size="lg"
            className="h-14 px-8 text-lg gradient-primary shadow-glow hover:scale-105 transition-smooth"
          >
            Create Session Now
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Index;
