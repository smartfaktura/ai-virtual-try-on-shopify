
ALTER TABLE public.workflows ADD COLUMN slug TEXT;

UPDATE public.workflows SET slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));

ALTER TABLE public.workflows ALTER COLUMN slug SET NOT NULL;
ALTER TABLE public.workflows ADD CONSTRAINT workflows_slug_unique UNIQUE (slug);
