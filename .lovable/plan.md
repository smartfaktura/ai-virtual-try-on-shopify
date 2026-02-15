

## Update Product Listing Set Feature Text

### Problem
The first bullet point for the Product Listing Set says "8 diverse scenes from white studio to lifestyle" but the workflow actually has **30 scenes** across 6 categories (Studio Essentials, Surface & Texture, Lifestyle Context, Editorial & Creative, Dynamic & Effects, Storytelling & Context).

### Fix

**File: `src/components/app/WorkflowCard.tsx`** (line 27)

Change:
```
'8 diverse scenes from white studio to lifestyle'
```
To:
```
'30 diverse scenes from white studio to lifestyle & beyond'
```

Single line change, no other files affected.

