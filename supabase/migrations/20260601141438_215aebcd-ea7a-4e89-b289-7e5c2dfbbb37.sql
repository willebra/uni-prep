
DROP POLICY IF EXISTS "Anyone can update materials" ON public.materials;
REVOKE UPDATE ON public.materials FROM anon, authenticated;
