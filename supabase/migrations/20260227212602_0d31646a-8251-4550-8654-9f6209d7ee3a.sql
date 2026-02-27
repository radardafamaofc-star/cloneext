CREATE TABLE scheduled_messages (
  id serial PRIMARY KEY,
  phone_number text NOT NULL,
  message text NOT NULL,
  scheduled_at timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to scheduled_messages" ON scheduled_messages FOR ALL USING (true) WITH CHECK (true);
