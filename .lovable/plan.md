# Fix: "Saving…" button stuck on Settings page

## What's happening

On `/app/settings`, the **Save Settings** button at the bottom can get stuck on "Saving…" forever (visible as the gray pill in the bottom-right of your screenshot). Reload is the only way out.

## Root cause

In `src/pages/Settings.tsx`, both save handlers do `setIsSaving(true)` → multiple `await`s → `setIsSaving(false)` with **no `try/catch/finally`**. If any awaited call throws (network blip, RLS rejection, `.single()` returning zero rows, or the Resend sync hanging), the final `setIsSaving(false)` is never reached and the button stays disabled with the "Saving…" label.

Two affected functions:
- `Settings.handleSave` (lines 288–337) — main Save Settings button
- `ContentPreferencesSection.handleSave` (lines 90–143) — Save preferences button

## Fix

Wrap both handlers in `try / catch / finally` so the loading state is **always** cleared:

1. Move `setIsSaving(false)` / `setSaving(false)` into a `finally` block — guarantees the button unfreezes no matter what.
2. Add `catch` blocks that show `toast.error('Failed to save settings')` and `console.error` the cause — user gets feedback instead of a silent freeze.
3. Make the secondary `select().single()` + `sync-resend-contact` call **fire-and-forget** (no `await` blocking the UI). The actual save has already succeeded by that point, so a slow Resend sync or a missing-profile edge case won't trap the button.
4. Use `.maybeSingle()` instead of `.single()` for the secondary profile lookup — tolerates the rare zero-row case without throwing.

## Technical change (illustrative)

```ts
const handleSave = async () => {
  if (!user) return;
  setIsSaving(true);
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        settings: JSON.parse(JSON.stringify(settings)),
        marketing_emails_opted_in: marketingOptIn,
      })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to save settings');
      return;
    }

    toast.success('Settings saved successfully!');

    // Fire-and-forget: never block the UI on Resend sync
    void (async () => {
      try {
        const { resolveFamilyNames } = await import('@/lib/onboardingTaxonomy');
        const { data: profileData } = await supabase
          .from('profiles')
          .select('product_categories, product_subcategories, first_name')
          .eq('user_id', user.id)
          .maybeSingle();
        // ...build payload, invoke sync-resend-contact (already .catch(() => {}))
      } catch { /* swallow — non-critical */ }
    })();
  } catch (err) {
    console.error('Settings save failed:', err);
    toast.error('Failed to save settings');
  } finally {
    setIsSaving(false);
  }
};
```

Apply the equivalent `try/catch/finally` pattern to `ContentPreferencesSection.handleSave`.

## Files to edit

- `src/pages/Settings.tsx` — both save handlers

## Out of scope

- No backend / RLS / edge function changes
- No UI redesign
- No DB migrations
