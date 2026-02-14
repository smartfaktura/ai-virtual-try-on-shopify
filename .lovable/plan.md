

## Update Virtual Try-On Set Feature List

Update the `featureMap` in `src/components/app/WorkflowCard.tsx` (lines 29-34):

**Current:**
- AI-powered virtual try-on on real models
- Choose from curated model & scene libraries
- Professional editorial-quality results
- Portrait-optimized 3:4 output ratio

**Updated:**
- AI-powered virtual try-on on real models
- 30+ diverse models & 30+ curated scenes to choose from
- Professional editorial-quality results
- All aspect ratios supported -- portrait, square & landscape

### Technical Details

Single file change in `src/components/app/WorkflowCard.tsx`, updating two lines in the `featureMap` object:
- Line 31: Replace "Choose from curated model & scene libraries" with "30+ diverse models & 30+ curated scenes to choose from"
- Line 33: Replace "Portrait-optimized 3:4 output ratio" with "All aspect ratios supported -- portrait, square & landscape"

