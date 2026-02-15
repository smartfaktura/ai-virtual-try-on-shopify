

## Fix Mirror Selfie Previews: Hide Phone Screen + Regenerate All

### Problem
1. Only 11 of 30 scene previews were generated -- 19 remain blank
2. In generated previews (e.g., Pool / Resort), the phone screen is visible facing the viewer, which looks unnatural. The phone's back should face the camera/viewer, with only the screen visible in the mirror reflection.

### Changes

#### 1. Fix All Mirror Selfie Prompts to Hide Phone Screen
**File: `supabase/functions/generate-scene-previews/index.ts`**

Add a critical constraint to every mirror selfie prompt. Replace the current phrasing pattern:
- OLD: `"holding smartphone at chest level capturing reflection"`
- NEW: `"holding smartphone with the back of the phone facing the viewer and the screen facing the mirror, phone screen is NOT visible to the camera"`

Additionally, append a universal negative instruction to the `MIRROR_FORMAT` constant:
```text
// Current
const MIRROR_FORMAT = "9:16 vertical story format, full body visible from head to shoes";

// Updated  
const MIRROR_FORMAT = "9:16 vertical story format, full body visible from head to shoes, the phone screen must face the mirror NOT the camera, only the back of the phone is visible to the viewer, no phone screen showing";
```

This single change propagates to all 30 mirror selfie prompts automatically since they all reference `MIRROR_FORMAT`.

Also update each individual prompt to reinforce this by changing "holding smartphone capturing reflection" to "holding smartphone with back of phone toward camera, screen facing the mirror, capturing reflection".

#### 2. Force Regenerate All 30 Previews
**After deploying the edge function:**
- Call the `generate-scene-previews` function with `force_regenerate: true` and `batch_size: 3`
- This clears all existing preview URLs first, then generates in batches of 3
- Will need approximately 10 sequential calls to complete all 30 scenes (each call takes ~60s)
- Each batch saves progress, so if a call times out the next call picks up where it left off

#### 3. Also Update the Main Prompt Template in Database
**Database update** to the `generation_config` for the Mirror Selfie Set workflow:
- Update the `prompt_template` field to reinforce: "screen facing the mirror, NOT the camera" and "only the back of the smartphone is visible to the viewer"
- This ensures actual user generations (not just previews) also follow this rule

### Execution Sequence
1. Update `MIRROR_FORMAT` constant and all individual mirror selfie prompts in edge function
2. Deploy edge function
3. Update database prompt template
4. Call edge function with `force_regenerate: true` repeatedly until all 30 are done (auto-batches of 3)

