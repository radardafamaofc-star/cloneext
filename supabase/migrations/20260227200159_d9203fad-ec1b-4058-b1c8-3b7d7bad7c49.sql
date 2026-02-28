CREATE TABLE public.bot_shortcuts (
  id serial PRIMARY KEY,
  question text NOT NULL,
  answer text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.bot_shortcuts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to bot_shortcuts" ON public.bot_shortcuts
  FOR ALL
  USING (true)
  WITH CHECK (true);