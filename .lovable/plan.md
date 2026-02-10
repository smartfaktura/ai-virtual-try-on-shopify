

## Admin System, "Add as Scene/Model", and Featured Curation

This is a significant feature that introduces role-based admin capabilities, allowing admins to promote generated images into platform-wide scenes/models and curate featured content in the Discover gallery.

---

### 1. Admin Role System

**Database changes:**
- Create `app_role` enum type with values: `admin`, `user`
- Create `user_roles` table with `user_id` (references auth.users), `role` (app_role), unique constraint on (user_id, role)
- Create `has_role(uuid, app_role)` security definer function to check roles without recursive RLS
- RLS on `user_roles`: only admins can read all roles, regular users can read their own
- You (the project owner) will need to manually insert your user_id into `user_roles` with role `admin` via the backend SQL runner

**Frontend:**
- Create `useIsAdmin` hook that queries `user_roles` for the current user
- Conditionally show admin actions throughout the UI based on this hook

---

### 2. "Add as Scene" from Freestyle Library

When an admin views a generated image in the Freestyle gallery, they see an "Add as Scene" button. Clicking it:

**Database changes:**
- Create `custom_scenes` table: `id`, `name`, `description`, `category` (PoseCategory), `image_url`, `created_by` (uuid), `is_active` (bool, default true), `created_at`
- RLS: everyone authenticated can SELECT active scenes; only admins can INSERT/UPDATE/DELETE (using `has_role` function)

**Edge function: `create-scene-from-image`**
- Receives the image URL
- Calls Gemini (google/gemini-2.5-flash) with the image to auto-generate a scene name, description, and suggested category in the style of the existing scene descriptions (e.g., "Cozy evening ambiance with warm lighting and dramatic shadows")
- Returns the generated metadata for the admin to review/edit before saving
- Saves to `custom_scenes` table

**Frontend flow:**
1. Admin clicks "Add as Scene" on a freestyle image
2. A modal appears showing the image + AI-generated name, description, and category (editable)
3. Admin confirms, scene is saved to `custom_scenes`
4. The scene selector (SceneSelectorChip) and Discover page merge `custom_scenes` from DB with the hardcoded `mockTryOnPoses`, so the new scene appears for all users

---

### 3. "Add as Model" from Freestyle Library

Same concept for models.

**Database changes:**
- Create `custom_models` table: `id`, `name`, `gender`, `body_type`, `ethnicity`, `age_range`, `image_url`, `created_by` (uuid), `is_active` (bool, default true), `created_at`
- RLS: everyone authenticated can SELECT active models; only admins can INSERT/UPDATE/DELETE

**Edge function: `create-model-from-image`**
- Receives the image URL
- Calls Gemini with the image to analyze and suggest: name, gender, body type, ethnicity, age range
- Returns the AI-suggested metadata for admin review
- Saves to `custom_models` table

**Frontend flow:**
1. Admin clicks "Add as Model" on a freestyle image
2. Modal with AI-suggested attributes (name, gender, body type, ethnicity, age range) -- all editable
3. Admin confirms, model is saved to `custom_models`
4. ModelSelectorChip merges `custom_models` from DB with hardcoded `mockModels`

---

### 4. Featured Curation System for Discover

Admins can mark Discover items as "featured" to pin them to the top of the gallery.

**Database changes:**
- Create `featured_items` table: `id`, `item_type` (text: 'preset', 'scene', 'custom_scene'), `item_id` (text), `featured_by` (uuid), `sort_order` (int, default 0), `created_at`
- RLS: everyone authenticated can SELECT; only admins can INSERT/DELETE
- Unique constraint on (item_type, item_id)

**Frontend (Discover page):**
- When admin is viewing the Discover gallery, each card shows a small star/pin icon overlay
- Clicking it toggles featured status (insert/delete from `featured_items`)
- Featured items are sorted to the top of the grid with a subtle "Featured" badge
- The sort order among featured items is based on `created_at` DESC (newest featured goes to top)
- Admin sees a "Remove from featured" action on already-featured items

**Frontend (DiscoverDetailModal):**
- Admin sees a "Feature this" / "Remove from featured" toggle button in the modal actions area

---

### 5. Admin Actions on Freestyle Gallery Images

**Changes to `FreestyleGallery.tsx`:**
- Add an admin action menu (or extra buttons) on each image card when user is admin
- Actions: "Add as Scene", "Add as Model"
- These open the respective modals described above

---

### Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/create-scene-from-image/index.ts` | AI-powered scene metadata generation |
| `supabase/functions/create-model-from-image/index.ts` | AI-powered model metadata generation |
| `src/hooks/useIsAdmin.ts` | Hook to check admin status from `user_roles` |
| `src/hooks/useCustomScenes.ts` | Fetch custom scenes from DB |
| `src/hooks/useCustomModels.ts` | Fetch custom models from DB |
| `src/hooks/useFeaturedItems.ts` | Fetch/toggle featured items |
| `src/components/app/AddSceneModal.tsx` | Admin modal to review/edit AI-generated scene metadata |
| `src/components/app/AddModelModal.tsx` | Admin modal to review/edit AI-generated model metadata |

### Files to Modify

| File | Changes |
|------|---------|
| Database (migration) | Create `app_role` enum, `user_roles`, `custom_scenes`, `custom_models`, `featured_items` tables with RLS |
| `src/components/app/freestyle/FreestyleGallery.tsx` | Add admin action buttons on image cards |
| `src/components/app/freestyle/ModelSelectorChip.tsx` | Merge `custom_models` with `mockModels` |
| `src/components/app/freestyle/SceneSelectorChip.tsx` | Merge `custom_scenes` with `mockTryOnPoses` |
| `src/pages/Discover.tsx` | Merge custom scenes, integrate featured sorting, admin featured toggle |
| `src/components/app/DiscoverCard.tsx` | Show featured badge + admin star overlay |
| `src/components/app/DiscoverDetailModal.tsx` | Admin "Feature this" button |

### Technical Details

**Admin role check (useIsAdmin hook):**
```typescript
const { data: isAdmin } = useQuery({
  queryKey: ['is-admin', user?.id],
  queryFn: async () => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user!.id)
      .eq('role', 'admin')
      .maybeSingle();
    return !!data;
  },
  enabled: !!user?.id,
});
```

**Scene creation edge function (simplified):**
```typescript
// Call Gemini to analyze the image
const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  method: "POST",
  headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "google/gemini-2.5-flash",
    messages: [{
      role: "user",
      content: [
        { type: "text", text: "Analyze this image as a photography scene. Return JSON: { name, description, category }. Categories: studio, lifestyle, editorial, streetwear, clean-studio, surface, flat-lay, kitchen, living-space, bathroom, botanical. Description should be 10-15 words describing the environment, lighting, and mood." },
        { type: "image_url", image_url: { url: imageUrl } }
      ]
    }]
  })
});
```

**Featured sorting in Discover:**
```typescript
// Sort: featured items first (by sort_order), then non-featured by original order
const sorted = [...filtered].sort((a, b) => {
  const aFeatured = featuredMap.get(getItemId(a));
  const bFeatured = featuredMap.get(getItemId(b));
  if (aFeatured && !bFeatured) return -1;
  if (!aFeatured && bFeatured) return 1;
  if (aFeatured && bFeatured) return bFeatured.created_at - aFeatured.created_at;
  return 0;
});
```

### Setup Required After Implementation

After the migration runs, you will need to add yourself as an admin by running this SQL in the backend:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR_USER_ID_HERE', 'admin');
```

You can find your user ID by checking the profiles table.

