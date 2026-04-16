
## Goal

Restyle the Monthly / Annual switch inside the plans popup so it no longer looks like the main primary CTA, while keeping the real plan buttons as the strongest action.

## Plan

### 1. Update both billing toggles in `src/components/app/NoCreditsModal.tsx`
I’ll adjust the two segmented controls in this file:

- Free-plan popup toggle in `FreePlanSection` around lines `80–99`
- Paid-user upgrade toggle above `UpgradeCard` around lines `435–455`

### 2. Replace the active primary pill styling with a neutral segmented-control style
Right now the selected state uses primary-brand classes like:

- `bg-primary`
- `text-primary-foreground`

I’ll change the selected state to a softer neutral treatment, for example:

- selected tab: `bg-card text-foreground shadow-sm border border-border/60`
- unselected tab: `text-muted-foreground hover:text-foreground`

This keeps the control readable and premium, but removes the “main CTA button” feeling.

### 3. Tone down the embedded annual savings chip
The small `-20%` / `SAVE 20%` badge inside the Annual option is also using strong primary styling.

I’ll switch that chip to a quiet light-grey badge style so it matches the SAVE / NEW direction better and doesn’t compete with the plan buttons.

### 4. Keep CTA hierarchy intact
I will leave the actual plan buttons unchanged:

- `Get Starter`
- `Get Growth`
- `Get Pro`

That way the hierarchy becomes:

```text
Primary buttons = main action
Monthly / Annual toggle = selection control
SAVE / NEW badges = supporting info
```

## Technical details

- File: `src/components/app/NoCreditsModal.tsx`
- Scope: styling only
- No logic or pricing behavior changes
- No layout changes, only class updates on the toggle states and annual savings chip

## Expected result

The popup will feel cleaner and more premium:
- Monthly / Annual looks like a selector, not a CTA
- the main plan button keeps the strongest emphasis
- the overall modal has less competing dark/primary elements
