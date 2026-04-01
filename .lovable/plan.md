

# Move Batch Mode Toggle Into Upload Section

## Problem
The Batch Mode toggle sits above the upload card as a separate element, visually disconnected from the upload area it controls. It should be part of the upload card itself for better UX flow.

## Change

### `src/pages/video/AnimateVideo.tsx`

1. **Remove** the standalone Batch Mode toggle block (lines 542-581) from above the upload card
2. **Move it inside** the upload card (the `rounded-2xl border` container starting at line 586), placing it as the first element — a compact row at the top of the card, above the heading text
3. Style it as a subtle inline row with a thin bottom divider (`border-b`) separating it from the upload content below, rather than its own bordered card
4. Keep all existing logic (paid/free gating, Sophia avatar, upgrade button) intact

### Layout result
```text
┌─────────────────────────────────┐  ┌──────────────┐
│ [icon] Batch Mode    [Upgrade] [⊙] │  │ How it works │
│ ─────────────────────────────── │  │ ...          │
│ Upload your product image       │  │              │
│ We'll detect category...        │  │              │
│                                 │  │              │
│   ┌─ - - - - - - - - - - ─┐   │  │              │
│   │  Drop image here       │   │  │              │
│   └─ - - - - - - - - - - ─┘   │  │              │
│                                 │  │              │
│  [Upload] [Library] [Paste]     │  │              │
└─────────────────────────────────┘  └──────────────┘
```

No other files affected.

