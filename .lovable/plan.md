

# Fix Background Inconsistency in 6 Sneaker Editorial Scenes

## Problem
Six sneaker editorial scenes (`elevator-mirror-shot`, `curtain-runway-shot`, `gallery-bench-shot`, `plinth-knee-shot`, `sun-steps-shot`, `shadow-plinth-shot`) have `background` listed in their `trigger_blocks` but their prompt templates do NOT contain `{{background}}`. 

This means:
1. The UI shows a background color picker for these scenes
2. The user picks a color (e.g. sage)
3. The prompt builder sees no `{{background}}` token in the template → falls through to the auto-inject path (line 1256)
4. A generic `Background: sage seamless studio background...` gets appended at the end of the prompt
5. This contradicts the scene's own environment (gallery, stairs, curtain runway, etc.)
6. The AI model gets confused → some shots honor the scene environment, others honor the appended background → inconsistency

## Fix
**Remove `background` from `trigger_blocks`** for these 6 scenes. They are editorial scenes with defined environments — a studio background picker doesn't make sense for them. This is a data update, not a schema change.

```sql
UPDATE product_image_scenes 
SET trigger_blocks = array_remove(trigger_blocks, 'background')
WHERE scene_id IN (
  'elevator-mirror-shot',
  'curtain-runway-shot', 
  'gallery-bench-shot',
  'plinth-knee-shot',
  'sun-steps-shot',
  'shadow-plinth-shot'
);
```

This single update ensures these scenes no longer show a background picker in the UI and no conflicting background instruction gets injected into the prompt.

## Files changed
1. Database update — remove `background` from `trigger_blocks` on 6 editorial sneaker scenes

