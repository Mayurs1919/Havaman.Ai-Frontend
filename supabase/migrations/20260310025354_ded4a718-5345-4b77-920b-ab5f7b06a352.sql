
-- QR login sessions for cross-device auth
CREATE TABLE public.qr_login_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'authenticated', 'expired')),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '5 minutes')
);

-- Enable RLS
ALTER TABLE public.qr_login_sessions ENABLE ROW LEVEL SECURITY;

-- Anyone can read a session by token (needed for polling)
CREATE POLICY "Anyone can read qr sessions" ON public.qr_login_sessions
  FOR SELECT USING (true);

-- Anyone can insert (desktop creates session)
CREATE POLICY "Anyone can create qr sessions" ON public.qr_login_sessions
  FOR INSERT WITH CHECK (true);

-- Authenticated users can update (mobile marks as authenticated)
CREATE POLICY "Authenticated users can update qr sessions" ON public.qr_login_sessions
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Enable realtime for polling
ALTER PUBLICATION supabase_realtime ADD TABLE public.qr_login_sessions;
