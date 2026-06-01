
CREATE TABLE public.materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Untitled material',
  source_text text NOT NULL,
  study jsonb,
  questions jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.materials TO anon, authenticated;
GRANT ALL ON public.materials TO service_role;

ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read materials" ON public.materials FOR SELECT USING (true);
CREATE POLICY "Anyone can create materials" ON public.materials FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update materials" ON public.materials FOR UPDATE USING (true) WITH CHECK (true);
