
-- Add slug column
ALTER TABLE public.discover_presets ADD COLUMN IF NOT EXISTS slug text;

-- Create slugify + auto-generate trigger function
CREATE OR REPLACE FUNCTION public.generate_discover_preset_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  v_slug text;
BEGIN
  -- Slugify: lowercase, replace non-alphanumeric with hyphens, trim hyphens
  v_slug := lower(NEW.title);
  v_slug := regexp_replace(v_slug, '[^a-z0-9]+', '-', 'g');
  v_slug := trim(both '-' from v_slug);
  -- Append first 6 chars of UUID for uniqueness
  v_slug := v_slug || '-' || left(NEW.id::text, 6);
  NEW.slug := v_slug;
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trg_discover_preset_slug ON public.discover_presets;
CREATE TRIGGER trg_discover_preset_slug
  BEFORE INSERT OR UPDATE OF title ON public.discover_presets
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_discover_preset_slug();

-- Backfill existing rows
UPDATE public.discover_presets
SET slug = trim(both '-' from regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g')) || '-' || left(id::text, 6)
WHERE slug IS NULL;

-- Now make it NOT NULL and UNIQUE
ALTER TABLE public.discover_presets ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_discover_presets_slug ON public.discover_presets (slug);
