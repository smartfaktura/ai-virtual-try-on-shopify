

# Improve Freestyle Prompt Card — Show Full Feature Set

## Problem
The current card only shows a typing prompt animation, making it look like a text-only tool. Freestyle actually supports **product selection, model/avatar selection, scene selection, and brand profiles** — the card should communicate this visually.

## Changes

### 1. Replace abstract floating frames with feature-representative chips
Instead of empty gradient `FloatingFrame` boxes, show animated **mini chip strips** that cycle through the freestyle features:

- **Product chip**: Small pill with a package icon + "Select Product" that animates to show "Skincare Bottle", "Leather Bag", etc.
- **Model chip**: Small pill with 2-3 tiny circular avatar placeholders (styled like the model selector) + "Add Model"
- **Scene chip**: Small pill with a landscape icon + "Beach Sunset", "Studio Light", etc. cycling

These chips sit **above** the prompt composer, arranged horizontally, mimicking the real FreestyleSettingsChips layout but miniaturized. They should fade/cycle with a staggered animation to feel alive.

### 2. Update the prompt composer area
Keep the typing animation but add a thin row of mini icons below the prompt text (before the "Describe anything" bar) showing: Product icon, Model avatar circle, Scene icon, Aspect ratio icon — like a miniature version of the real chip bar. These appear subtly on hover.

### 3. CTA change
Replace "Open Prompt" with **"Open Studio"** — short, premium, and communicates it's a full creative workspace, not just a prompt box.

### 4. Badge update
Change "Custom Prompt" badge to **"Freestyle Studio"** to reinforce the full-feature nature.

## Files to Change

| File | Change |
|------|--------|
| `src/components/app/FreestylePromptCard.tsx` | Replace FloatingFrames with animated feature chips; add mini settings row; update CTA to "Open Studio"; update badge text |

## Visual Layout (inside the card visual area)

```text
┌─────────────────────────────┐
│  ✧ FREESTYLE STUDIO         │ ← badge
│                              │
│  [📦 Product] [👤 Model]    │ ← mini animated chips
│  [🏔 Scene]   [1:1]         │   (cycle through options)
│                              │
│  ┌─────────────────────┐    │
│  │ A luxury skincare... │    │ ← typing prompt
│  │                      │    │
│  │ Describe anything  ✧│    │
│  └─────────────────────┘    │
│                              │
├─────────────────────────────┤
│  Freestyle Studio            │
│  Prompt + product + model    │
│  [     Open Studio  →    ]   │
└─────────────────────────────┘
```

## Animation Details
- Chips cycle labels every ~2.5s with a fade transition (e.g., Product chip shows "Skincare" → "Sneakers" → "Leather Bag")
- Model chip shows 2-3 small gray avatar circles that pulse subtly
- On hover: chips become slightly more opaque, prompt box gets glow
- Keep existing typing animation for the prompt text

## CTA Rationale
"Open Studio" is chosen because:
- Short (2 words)
- Communicates a workspace, not just a text box
- Premium feel
- Matches the product's "Freestyle Studio" terminology

