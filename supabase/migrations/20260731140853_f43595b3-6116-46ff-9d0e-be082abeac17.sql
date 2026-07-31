DROP POLICY IF EXISTS "Anyone can create materials" ON public.materials;

REVOKE INSERT, UPDATE, DELETE ON public.materials FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.materials FROM authenticated;
GRANT SELECT ON public.materials TO anon;
GRANT SELECT ON public.materials TO authenticated;
GRANT ALL ON public.materials TO service_role;