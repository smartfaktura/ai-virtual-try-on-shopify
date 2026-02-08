

## Fix: Aspect Ratio Not Being Enforced in Generated Images

### Root Cause

The aspect ratio selected in the UI (e.g., 1:1) is only appended as a text instruction inside the prompt:
```
Output aspect ratio: 1:1
```

The AI model treats this as a *suggestion*, not a hard constraint. For fashion/portrait content, it naturally defaults to taller ratios like 4:3 or 3:4, ignoring the text instruction entirely.

### The Fix

The AI Gateway supports a dedicated `image_config` parameter that enforces the aspect ratio at the API level -- guaranteeing the output dimensions match the user's selection.

### Technical Changes

**File: `supabase/functions/generate-freestyle/index.ts`**

1. **Pass `aspectRatio` into `generateImage()`** -- add it as a parameter so the function can include it in the API request body.

2. **Add `image_config` to the API request body:**
   ```json
   {
     "model": "...",
     "messages": [...],
     "modalities": ["image", "text"],
     "image_config": {
       "aspect_ratio": "1:1"
     }
   }
   ```

3. **Keep the text instruction as a secondary reinforcement** -- the text prompt will still mention the aspect ratio as a hint, but the `image_config` parameter will be the authoritative control.

### What Changes
- `generateImage()` function signature gets an `aspectRatio` parameter
- The `fetch()` call body includes the new `image_config` field
- Each call in the generation loop passes the selected aspect ratio through

### No Frontend Changes Needed
The frontend already correctly sends the aspect ratio value. This is purely a backend fix to use the proper API parameter instead of relying on text instructions.

