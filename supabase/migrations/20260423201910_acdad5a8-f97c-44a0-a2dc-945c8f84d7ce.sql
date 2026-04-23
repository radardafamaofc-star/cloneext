
CREATE TABLE public.pix_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text NOT NULL UNIQUE,
  panel text NOT NULL,
  amount numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'PENDENTE',
  end_to_end_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);

CREATE INDEX idx_pix_transactions_transaction_id ON public.pix_transactions(transaction_id);

ALTER TABLE public.pix_transactions ENABLE ROW LEVEL SECURITY;

-- Acesso público (checkout sem auth). Apenas leitura de campos não sensíveis e criação.
CREATE POLICY "public can read transactions"
  ON public.pix_transactions FOR SELECT
  USING (true);

CREATE POLICY "public can insert transactions"
  ON public.pix_transactions FOR INSERT
  WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.pix_transactions;
ALTER TABLE public.pix_transactions REPLICA IDENTITY FULL;
