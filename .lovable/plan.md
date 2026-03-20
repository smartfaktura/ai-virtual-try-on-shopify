

# Fix: Don't Pre-select Aspect Ratio in Creative Drops Wizard

## Problem
The `formats` state defaults to `['1:1']`, pre-selecting the 1:1 ratio. User wants no pre-selection — they should choose themselves.

## Change

### File: `src/components/app/CreativeDropWizard.tsx` (line 205)
Change default from `['1:1']` to `[]`:
```
return [];
```

Also need to ensure validation on Step 2 requires at least 1 format selected before proceeding.

