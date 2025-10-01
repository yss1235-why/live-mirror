-- Create sessions table for managing browsing sessions
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  host_id TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create session_events table for storing sync events
CREATE TABLE public.session_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_events ENABLE ROW LEVEL SECURITY;

-- Sessions policies - Allow anyone to read active sessions
CREATE POLICY "Anyone can view active sessions"
ON public.sessions FOR SELECT
USING (active = true);

CREATE POLICY "Hosts can create sessions"
ON public.sessions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Hosts can update their own sessions"
ON public.sessions FOR UPDATE
USING (host_id = (SELECT host_id FROM public.sessions WHERE id = sessions.id));

-- Session events policies
CREATE POLICY "Anyone can view session events"
ON public.session_events FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.sessions 
  WHERE id = session_events.session_id 
  AND active = true
));

CREATE POLICY "Anyone can create session events"
ON public.session_events FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.sessions 
  WHERE id = session_events.session_id 
  AND active = true
));

-- Enable realtime for session_events
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_events;

-- Create index for better query performance
CREATE INDEX idx_session_events_session_id ON public.session_events(session_id);
CREATE INDEX idx_session_events_created_at ON public.session_events(created_at DESC);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sessions_updated_at
BEFORE UPDATE ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();