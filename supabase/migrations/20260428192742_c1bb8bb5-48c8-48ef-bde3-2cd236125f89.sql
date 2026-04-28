-- 1. Add composite index for the gallery query (sort_order asc, created_at desc tiebreaker)
CREATE INDEX IF NOT EXISTS idx_discover_presets_sort_created
  ON public.discover_presets (sort_order ASC, created_at DESC);

-- 2. Drop the redundant SELECT policy that forces per-row evaluation of auth.role().
-- The remaining "Anyone can view discover presets publicly" policy (anon, USING true)
-- already grants read access to everyone, including authenticated users (the anon role
-- is granted to authenticated as well in PostgREST).
DROP POLICY IF EXISTS "Authenticated users can view discover presets" ON public.discover_presets;