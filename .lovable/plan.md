

# Prompt Tokens Reference Page + UX Fix

## Problem
The current token reference is a collapsible panel inside the scenes admin page — requires multiple clicks to open groups, tokens are tiny, no usage examples, and it blocks the scene list. Slow and unfriendly for prompt engineering work.

## Solution
Create a dedicated **Prompt Tokens Reference** page at `/app/admin/prompt-tokens` with a flat, searchable, always-visible layout. Keep a slim link button on the scenes page pointing to it.

## Changes

### 1. New page: `src/pages/AdminPromptTokens.tsx`
- Full-page token reference with **search bar** at top (filters across all groups)
- All groups **expanded by default** — no clicking to open
- Each token rendered as a card/row showing:
  - `{{tokenName}}` (click to copy)
  - Description
  - **Example value** (e.g. `{{flowersRelated}}` → `"white rose, jasmine, peony"`)
  - **Example usage in prompt** (e.g. `"Surround the bottle with fresh {{flowersRelated}}, scattered naturally on the surface"`)
- Sticky category sidebar/tabs for quick jumping between groups
- Color-coded group headers (System = blue, Visual = purple, Semantic = green, Category = amber)

### 2. Add route in `src/App.tsx`
- Lazy import + route at `/admin/prompt-tokens`

### 3. Simplify token UI in `src/pages/AdminProductImageScenes.tsx`
- Replace the bulky collapsible token panel with a single link button: **"Open Token Reference →"** that navigates to `/app/admin/prompt-tokens` (opens in new tab)
- Keep the prompt template textarea as-is

### Token Data Structure
Each token entry will include:
```typescript
{
  name: string;        // e.g. "flowersRelated"
  desc: string;        // e.g. "Related flowers for styling"
  example: string;     // e.g. "white rose, jasmine, peony"
  usage: string;       // e.g. "Surround the product with fresh {{flowersRelated}} on a marble surface"
}
```

All 100+ tokens will have example values and usage prompts covering System, Global Visual, Global Semantic, and all 10 category groups.

### Files
- **New**: `src/pages/AdminPromptTokens.tsx`
- **Edit**: `src/App.tsx` — add route
- **Edit**: `src/pages/AdminProductImageScenes.tsx` — replace collapsible token panel with link button

