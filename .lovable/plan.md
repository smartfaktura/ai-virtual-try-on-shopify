

# Update 6 Activewear Scenes: Powder Blue → Dynamic {{aestheticColor}}

## Summary

Update all 6 `activewear-powderblue-*` scenes to become fully color-dynamic. Every instance of "Powder Blue" in titles, scene IDs, prompt templates, and outfit hints gets replaced with either "Aesthetic" (for naming) or the `{{aestheticColor}}` token (for prompt content). The `= Powder Blue` assignment pattern is removed so the token resolves dynamically.

## What Changes (6 UPDATE statements via insert tool)

### Naming changes
- All `scene_id`: `powderblue` → `aesthetic`
- All `title`: "Powder Blue" → "Aesthetic"
- `suggested_colors` set to: `[{"hex":"#C2714F","label":"Terracotta"}]`

### Prompt template changes (applied to all 6 scenes)

Every "Powder Blue" string becomes `{{aestheticColor}}`. The `{{aestheticColor}} = Powder Blue` assignment becomes just `{{aestheticColor}}`.

**Concrete examples of replacements in prompts:**

| Before | After |
|--------|-------|
| `{{aestheticColor}} = Powder Blue shapes the mood` | `{{aestheticColor}} shapes the mood` |
| `Use Powder Blue only in the environment, props, surfaces` | `Use {{aestheticColor}} only in the environment, props, surfaces` |
| `Use Powder Blue through walls, court markings, props` | `Use {{aestheticColor}} through walls, court markings, props` |
| `Use Powder Blue in mats, dumbbells, wall tone` | `Use {{aestheticColor}} in mats, dumbbells, wall tone` |
| `Use Powder Blue in paper backdrops, floor tone` | `Use {{aestheticColor}} in paper backdrops, floor tone` |
| `Use Powder Blue through mats, walls, dumbbells` | `Use {{aestheticColor}} through mats, walls, dumbbells` |
| `Use Powder Blue through set walls, floors, props` | `Use {{aestheticColor}} through set walls, floors, props` |
| `Build a Powder Blue world through walls` | `Build a {{aestheticColor}} world through walls` |

### Outfit hint changes

| Scene | Before | After |
|-------|--------|-------|
| Portrait | `subtle Powder Blue accents` | `subtle {{aestheticColor}} accents` |
| Court Story | `tiny Powder Blue support accents` | `tiny {{aestheticColor}} support accents` |
| Soft Gym | `Powder Blue support accents` | `{{aestheticColor}} support accents` |
| UGC Mirror | `Powder Blue accents in the environment` | `{{aestheticColor}} accents in the environment` |
| Hero | `subtle Powder Blue environment accents` | `subtle {{aestheticColor}} environment accents` |
| Flat Lay | no outfit_hint (stays NULL) | stays NULL |

## Rows affected

| UUID | New scene_id | New Title |
|------|-------------|-----------|
| `09f32194...` | `activewear-aesthetic-portrait` | Aesthetic Sport Portrait |
| `857b69d6...` | `activewear-aesthetic-court-story` | Aesthetic Court Story |
| `c975b383...` | `activewear-aesthetic-soft-gym` | Aesthetic Soft Gym |
| `ca7b13f7...` | `activewear-aesthetic-flatlay-story` | Aesthetic Set Flat Lay |
| `1671e070...` | `activewear-aesthetic-ugc-mirror` | Aesthetic UGC Mirror |
| `7753741c...` | `activewear-aesthetic-hero-finisher` | Aesthetic Sport Hero |

## Implementation

Run 6 `UPDATE` statements via the database insert tool updating `scene_id`, `title`, `prompt_template`, `outfit_hint`, and `suggested_colors` for each row. No code changes needed.

