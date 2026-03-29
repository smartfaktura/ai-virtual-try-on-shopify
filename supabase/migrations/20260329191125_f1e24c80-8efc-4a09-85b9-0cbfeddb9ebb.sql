CREATE POLICY "No client profile deletion"
  ON profiles FOR DELETE TO authenticated
  USING (false);