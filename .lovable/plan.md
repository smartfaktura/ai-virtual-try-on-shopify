## Phase 1 — Migration (additive only)

Adds Brand Scenes ownership columns to `product_image_scenes`, tightens RLS to allow user-owned scenes, and installs a safety trigger. Behavior for anon, regular users, and admins on existing rows stays identical.

### What changes

**New columns on `product_image_scenes`** (all nullable / defaulted — zero impact on existing rows):

- `owner_user_id uuid` — null = admin/global (current behavior), set = private brand scene
- `is_brand_scene boolean default false`
- `brand_scene_answers jsonb default '{}'`
- `brand_scene_schema_version int default 1`
- `brand_scene_module text` — e.g. `'activewear.v1'`
- `source_generation_id uuid`

**Indexes:** `(owner_user_id, is_active)` + partial `where is_brand_scene = true`.

### RLS rewrite (behavior-preserving)

Drops the two existing SELECT policies (one too loose) and replaces with explicit anon/auth policies. Admins keep full access. Adds user CRUD limited to their own brand scenes.

```sql
DROP POLICY "Public can read active scenes" ON product_image_scenes;
DROP POLICY "Authenticated can read active scenes" ON product_image_scenes;

-- Anon: only global active scenes (= today's public behavior)
CREATE POLICY "Anon read active global scenes" ON product_image_scenes
  FOR SELECT TO anon
  USING (is_active = true AND owner_user_id IS NULL);

-- Authenticated: global active scenes + their own brand scenes; admins see all
CREATE POLICY "Auth read scenes" ON product_image_scenes
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(),'admin')
    OR (is_active = true AND (owner_user_id IS NULL OR owner_user_id = auth.uid()))
  );

-- Users write their own brand scenes only
CREATE POLICY "Users insert own brand scenes" ON product_image_scenes
  FOR INSERT TO authenticated
  WITH CHECK (owner_user_id = auth.uid() AND is_brand_scene = true);

CREATE POLICY "Users update own brand scenes" ON product_image_scenes
  FOR UPDATE TO authenticated
  USING (owner_user_id = auth.uid() AND is_brand_scene = true)
  WITH CHECK (owner_user_id = auth.uid() AND is_brand_scene = true);

CREATE POLICY "Users delete own brand scenes" ON product_image_scenes
  FOR DELETE TO authenticated
  USING (owner_user_id = auth.uid() AND is_brand_scene = true);
```

Admin INSERT/UPDATE/DELETE policies are untouched.

### Safety trigger (`saugiklis`)

Blocks misuse from the user-write path. Admin SECURITY DEFINER RPCs (e.g. `toggle_scene_featured`) are unaffected because they only operate on rows where `is_brand_scene = false`.

```sql
CREATE OR REPLACE FUNCTION public.protect_brand_scene_writes()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.is_brand_scene = true THEN
    IF NEW.scene_id IS NULL OR NEW.scene_id NOT LIKE 'brand-%' THEN
      RAISE EXCEPTION 'Brand scene scene_id must start with "brand-"';
    END IF;
    IF NEW.category_collection = 'bundle' THEN
      RAISE EXCEPTION 'Brand scenes cannot use bundle collection';
    END IF;
    IF NEW.sort_order < 0 AND NOT has_role(auth.uid(),'admin') THEN
      RAISE EXCEPTION 'Only admins can feature scenes (sort_order < 0)';
    END IF;
    IF NEW.owner_user_id IS NULL THEN
      RAISE EXCEPTION 'Brand scenes must have owner_user_id set';
    END IF;
  END IF;

  IF TG_OP = 'UPDATE'
     AND OLD.owner_user_id IS NOT NULL
     AND NEW.owner_user_id IS DISTINCT FROM OLD.owner_user_id
     AND NOT has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'Cannot change owner_user_id';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_brand_scene_writes_trg
  BEFORE INSERT OR UPDATE ON public.product_image_scenes
  FOR EACH ROW EXECUTE FUNCTION public.protect_brand_scene_writes();
```

### What does NOT change

- No existing rows are modified (all new columns default to NULL / false / `{}`).
- Anon SELECT keeps returning exactly the same scenes (`is_active = true`, all rows still have `owner_user_id IS NULL`).
- Admin paths and the existing CRUD hook in `useProductImageScenes` keep working.
- Edge functions: untouched.
- `generate-workflow`, scene picker, Create with Prompt: untouched.

### Post-migration smoke check

I'll run a read-only verification after the migration applies:
- count of rows visible to anon = count of `is_active = true` rows (proves anon policy intact)
- `\d product_image_scenes` shows the 6 new columns
- `pg_trigger` shows `protect_brand_scene_writes_trg`

No code changes, no UI changes in this phase. After the smoke check passes, we stop and wait for **"let's move to next phase"** before starting Phase 2 (types & validation).
