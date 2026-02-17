

## Fix Anatomy Issues in Freestyle Generation

### Problem
People are being generated with 3 arms, extra legs, unnatural poses, and duplicate fingers -- especially when prompted to hold products or sit.

### What We WON'T Do
- We will NOT touch the "No text, watermarks, logos" line yet since that's a separate issue worth discussing (it can strip legitimate product branding). That deserves its own focused fix.
- We will NOT make the prompt longer than necessary.

### Change

**File: `supabase/functions/generate-freestyle/index.ts`** -- line 86

Replace the weak single line:
```
- No distorted or extra fingers, hands, or limbs
```

With a focused 3-line anatomy block:
```
- Exactly 2 arms, 2 hands (5 fingers each), 2 legs per person — no extra, missing, or merged limbs
- Natural joint articulation only — no impossible bends, twisted spines, or backward limbs
- No duplicated or phantom body parts
```

That's it -- 3 short, specific lines replacing 1 vague line. Stays within prompt budget and targets exactly the problem.

### Technical Detail

| File | Lines | Change |
|---|---|---|
| `supabase/functions/generate-freestyle/index.ts` | 86 | Replace single anatomy line with 3 focused rules |

After editing, the function will be redeployed automatically.
