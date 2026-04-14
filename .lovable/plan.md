

# Verification: Short Film Pipeline Status

## What's already correct ✓

| Component | Status | Detail |
|-----------|--------|--------|
| `kling-lip-sync/index.ts` | ✓ Complete | Create + poll actions, JWT auth, proper CORS |
| `generate-video/index.ts` multishot | ✓ Fixed | `sound: "on"`, 1-based `image_list` index, `respond()` crash removed |
| `useShortFilmProject.ts` | ✓ Fixed | `with_audio: false` in both main + retry paths, lip-sync post-processing wired |
| `ai-shot-planner/index.ts` | ✓ Fixed | Product-focused script_line instructions, style presets isolated |
| `shortFilmPromptBuilder.ts` | ✓ Fixed | Character speech directives, softer human descriptions, sentence-boundary truncation |
| `generated-audio` UPDATE RLS | ✓ Migrated | Upsert now allowed |

## What's missing ✗

### `kling-lip-sync` not in `supabase/config.toml`

The function exists but **has no config entry**, so it won't deploy. Need to add:

```toml
[functions.kling-lip-sync]
  verify_jwt = false
```

This is a one-line addition to `supabase/config.toml`.

## Changes

### File: `supabase/config.toml`
Add `kling-lip-sync` function entry with `verify_jwt = false` at the end of the functions list.

That's it — everything else is properly wired.

