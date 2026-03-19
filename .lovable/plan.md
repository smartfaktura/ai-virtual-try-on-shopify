

# Rename "Schedule" to "Drop" & Clarify Scheduling as Optional Feature

## What Changes

### 1. Rename labels throughout the wizard
**File: `src/components/app/CreativeDropWizard.tsx`**

- "Schedule Name" → "Drop Name" (line 534)
- Placeholder "e.g. Summer 2026 Collection" stays (still relevant)
- Step label "Schedule" → "Delivery" in `getStepLabel` (line 271)
- "Schedule" button card description: "Pick a date & recur" → "Schedule for later (e.g. after credit renewal)"
- Success toast: "Schedule created successfully!" → "Drop saved — it will run on the scheduled date"
- Error messages: "schedule" → "drop" where appropriate
- Review step text references to "schedule" → "drop"

### 2. Reframe the Schedule option as a secondary feature
Currently "Generate Now" and "Schedule" are presented as equal options. The Schedule option should be repositioned as the fallback for users who lack credits now:

- Add a subtle helper under the "Schedule" card: "Ideal when waiting for your monthly credit renewal"
- Keep "Generate Now" as the default/primary option (already is)

### 3. Season/theme transfer — already working, no code change needed
The flow is already complete:
1. User picks a seasonal preset (e.g. "Spring") → its `instructions` text is stored in `themeNotes` state
2. The preset `id` (e.g. "spring") is stored in the `theme` field
3. On save, both `theme` and `theme_notes` go into `creative_schedules` table
4. `trigger-creative-drop` passes them into each job payload
5. `generate-workflow` injects them as a `SEASONAL DIRECTION:` block in the image generation prompt

No changes needed here — the system already transfers seasonal/campaign context to generation.

## Technical Details

All changes are in a single file: `src/components/app/CreativeDropWizard.tsx`

- Line 271: `getStepLabel` — change "Schedule" to "Delivery"
- Line 534: Label text "Schedule Name" → "Drop Name"
- Line 1258: Section header stays "Delivery" (already correct)
- Line 1283-1284: "Schedule" card description update
- Lines 464/478: Success toast wording
- Line 503: Header "Edit Schedule" → "Edit Drop"

No database changes needed — the table is still `creative_schedules` internally, only the user-facing labels change.

