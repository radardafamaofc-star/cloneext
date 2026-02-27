CREATE TABLE public.contacts (
  id serial PRIMARY KEY,
  phone_number text NOT NULL UNIQUE,
  name text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to contacts" ON public.contacts
  FOR ALL
  USING (true)
  WITH CHECK (true);