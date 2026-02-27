

## Fix "Replace All" Not Actually Replacing All Furniture

### Root Cause

In `supabase/functions/generate-workflow/index.ts` (line 291-297), the "Replace All" furniture handling mode has **no prompt block at all**. The code comment says `// 'Replace All' = no special block, current default behavior`. 

This means the AI receives no instruction to remove existing furniture. It sees the table in the reference photo and, following its default behavior of preserving architectural elements, keeps it. The general prompt says "stage this room" but never says "REMOVE all existing furniture first."

### The Fix

Add an explicit, strong "Replace All" instruction block (just like the other two modes have), making it crystal clear the AI must strip out ALL existing furniture before staging new pieces.

### Changes

**File: `supabase/functions/generate-workflow/index.ts`**

Replace the comment on line 296-297 with an actual prompt block for "Replace All":

```
} else {
  // Replace All mode — explicit removal instruction
  furnitureHandlingBlock = `\nFURNITURE HANDLING (CRITICAL): COMPLETELY REMOVE every single piece of existing furniture visible in the uploaded photo. Remove ALL tables, chairs, sofas, beds, shelves, desks, cabinets, rugs, lamps, and any other furnishings currently in the room. The room should first be treated as EMPTY — bare walls and floor only. Then stage it from scratch with entirely NEW furniture appropriate for this room type and the "${variation.label}" design style. NOTHING from the original photo's furniture should remain. If you can still see the original table, sofa, or any piece — you have failed this instruction.`;
}
```

This gives the AI an unmistakable, strongly-worded directive to remove everything before staging, including a self-check sentence at the end.

### Why This Works

- "Keep & Restyle" has 4 lines of strict instructions
- "Keep Layout, Swap Style" has 4 lines of strict instructions  
- "Replace All" had **zero** instructions -- the AI defaulted to preserving what it saw
- Now all three modes have equally strong, explicit directives

### File Summary

| File | Change |
|------|--------|
| `supabase/functions/generate-workflow/index.ts` | Add explicit "Replace All" furniture handling prompt block (~lines 296-297) |

One file, one targeted fix.

