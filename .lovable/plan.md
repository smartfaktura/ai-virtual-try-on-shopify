

# Rename Tabs & Button on Creative Drops Page

## Current → New

| Current | New |
|---------|-----|
| Tab 1: "Schedules" | **"Drops"** |
| Tab 2: "Drops" | **"Scheduled"** |
| Tab 3: "Calendar" | stays "Calendar" |
| Button: "Create Schedule" | **"Create Drop"** |

The first tab should show the drops (results), the second tab shows scheduled/recurring items, and the button says "Create Drop".

## Changes

### File: `src/pages/CreativeDrops.tsx`

1. **Swap tab values and labels** (lines 299-319):
   - First tab: `value="drops"`, label "Drops"
   - Second tab: `value="schedules"`, label "Scheduled"
   - Third tab: stays `value="calendar"`, label "Calendar"
   - Button text: "Create Drop" (both desktop and mobile)

2. **Update default active tab** (line 66): Change `useState('schedules')` → `useState('drops')` so Drops tab is shown first

3. **Swap `TabsContent` order** (lines 321-343 and 345+): Move the drops content first, schedules content second — matching the new tab order

4. **Update empty state text** in the schedules tab (line 331-333): "No schedules yet" → "No scheduled drops yet"

5. **Update `onLaunched` callback** (line 257): Already sets `setActiveTab('drops')` which now correctly maps to the first tab

6. **Update subtitle** (line 253): Change "Set up schedules" → "Set up drops"

7. **Update stat label** (line 276): "Active Schedules" → "Active Scheduled" or "Scheduled"

~15 lines of label/value changes across 1 file. No logic changes.

