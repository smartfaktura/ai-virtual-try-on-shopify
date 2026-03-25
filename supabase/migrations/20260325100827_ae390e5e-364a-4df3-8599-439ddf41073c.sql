ALTER TABLE custom_scenes ADD COLUMN prompt_hint text DEFAULT '';
ALTER TABLE custom_scenes ADD COLUMN prompt_only boolean DEFAULT false;