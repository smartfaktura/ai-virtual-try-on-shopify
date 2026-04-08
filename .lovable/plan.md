

# Fix: Remove Background Trigger from Lifestyle Person Scenes

## Problem
8 non-fragrance scenes with "lifestyle" in their name (person + real environment) incorrectly have `background` in `trigger_blocks` AND `{{background}}` in their prompt template. This causes a background color/gradient picker to appear for scenes that describe real-world environments (cafés, streets, gyms, vanities). A "sage green (#E8EDE6)" background injected into "a vanity, mirror, or getting-ready context" creates contradictory instructions.

## Affected Scenes (8)

| Scene ID | Category | Issue |
|----------|----------|-------|
| `in-hand-lifestyle-bags` | bags-accessories | `{{background}}` mid-sentence before "street, café, urban context" |
| `in-hand-lifestyle-beauty` | beauty-skincare | `{{background}}` before "bathroom, vanity, self-care context" |
| `in-hand-lifestyle-hats` | hats-small | `{{background}}` before "outdoor, casual, street context" |
| `in-hand-lifestyle-makeup` | makeup-lipsticks | `{{background}}` before "vanity, mirror, getting-ready context" |
| `in-hand-lifestyle-other` | other | `{{background}}` before "appropriate lifestyle context" |
| `in-hand-lifestyle-supplements` | supplements-wellness | `{{background}}` before "gym, kitchen, wellness context" |
| `on-body-lifestyle-hats` | hats-small | `BACKGROUND: {{background}} — use ONLY this` overrides natural context |
| `on-foot-lifestyle-shoes` | shoes | `BACKGROUND: {{background}} — use ONLY this` overrides natural context |

## Fix (2 changes per scene = 16 UPDATEs)

### 1. Remove `{{background}}` token from prompt templates
- For `in-hand-lifestyle-*` (5 scenes): Delete the `{{background}}` token (it sits between two sentences — just remove it)
- For `on-body-lifestyle-hats` and `on-foot-lifestyle-shoes`: Replace `BACKGROUND: {{background}} — use ONLY this background.` with the natural environment description already implied by the prompt

### 2. Remove `background` from `trigger_blocks`
Use `array_remove(trigger_blocks, 'background')` for all 8 scenes.

## Result
- Background picker hidden for all lifestyle person scenes
- Prompt builder won't inject a color/gradient into environment-based prompts
- Studio and packshot scenes remain unchanged (they correctly use `{{background}}`)

All database UPDATEs. No frontend code changes.

