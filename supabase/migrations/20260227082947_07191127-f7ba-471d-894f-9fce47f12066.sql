
-- Settings table
CREATE TABLE public.bot_settings (
  id serial PRIMARY KEY,
  system_prompt text NOT NULL DEFAULT 'Você é um assistente de vendas útil e amigável.',
  groq_api_key text DEFAULT '',
  is_active boolean DEFAULT false,
  company_name text DEFAULT '',
  owner_name text DEFAULT '',
  products text DEFAULT '',
  pix_key text DEFAULT '',
  custom_commands text DEFAULT ''
);

-- Chat logs table
CREATE TABLE public.chat_logs (
  id serial PRIMARY KEY,
  phone_number text NOT NULL,
  message text NOT NULL,
  response text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- WhatsApp status table
CREATE TABLE public.whatsapp_status (
  id serial PRIMARY KEY,
  status text NOT NULL DEFAULT 'disconnected',
  qr_code text,
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert default settings row
INSERT INTO public.bot_settings (system_prompt) VALUES ('Você é um assistente de vendas útil e amigável.');

-- Insert default whatsapp status row
INSERT INTO public.whatsapp_status (status) VALUES ('disconnected');

-- Allow public read/write for now (no auth)
ALTER TABLE public.bot_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to bot_settings" ON public.bot_settings FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to chat_logs" ON public.chat_logs FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.whatsapp_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to whatsapp_status" ON public.whatsapp_status FOR ALL USING (true) WITH CHECK (true);
