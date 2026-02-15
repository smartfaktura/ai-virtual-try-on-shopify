
-- Fix #1: Add INSERT policy on creative_drops
CREATE POLICY "Users can insert their own drops"
  ON public.creative_drops FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Fix #2: Add DELETE policy on creative_drops
CREATE POLICY "Users can delete their own drops"
  ON public.creative_drops FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix #3: Add WITH CHECK to creative_drops UPDATE policy
DROP POLICY "Users can update their own drops" ON public.creative_drops;
CREATE POLICY "Users can update their own drops"
  ON public.creative_drops FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix #4: Add WITH CHECK to creative_schedules UPDATE policy
DROP POLICY "Users can update their own schedules" ON public.creative_schedules;
CREATE POLICY "Users can update their own schedules"
  ON public.creative_schedules FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix #5: Change model_ids from UUID[] to TEXT[] to support mock model IDs
ALTER TABLE public.creative_schedules
  ALTER COLUMN model_ids TYPE TEXT[]
  USING model_ids::TEXT[];
