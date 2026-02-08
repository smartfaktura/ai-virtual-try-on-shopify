
-- Step 1: Add generation_config JSONB column to workflows table
ALTER TABLE public.workflows
ADD COLUMN generation_config jsonb DEFAULT NULL;
