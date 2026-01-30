

# Virtual Try-On UI/UX Improvements Plan

## Current State Analysis

After reviewing the implementation, I identified several areas where the Virtual Try-On experience can be significantly enhanced:

### Current Issues

1. **Mode Selection Step**: The toggle is functional but lacks visual appeal and doesn't showcase the value proposition of virtual try-on
2. **Model Selection**: Basic grid with tooltip-only details - users can't quickly compare models
3. **Pose Selection**: Similar to models, lacks context about what each pose is best for
4. **No Live Preview**: Users don't see their product + model combination until generation
5. **Missing Visual Hierarchy**: Steps blend together without clear progression cues
6. **No Quick Filters**: Only gender filter exists for models - no body type or style filters for poses

---

## Proposed Improvements

### 1. Enhanced Mode Selection with Visual Cards

Replace the simple toggle with two large visual cards that better communicate each mode:

| Product Shot | Virtual Try-On |
|--------------|----------------|
| Icon + illustration | Model silhouette with garment overlay |
| "Focus on the product" | "See it on a model" |
| 1-2 credits/image | 3 credits/image |
| Best for: detail shots, flat lay | Best for: lifestyle, lookbook |

Features:
- Large clickable cards with hover effects
- Clear visual distinction between modes
- Credit cost prominently displayed
- Use cases listed for guidance

### 2. Model Selection Enhancements

**Quick Filter Bar**:
- Gender: All | Female | Male
- Body Type: All | Slim | Athletic | Average | Plus Size
- Age: All | Young Adult | Adult | Mature

**Enhanced Model Cards**:
- Larger preview images with better aspect ratio
- Visible name, body type, and ethnicity without hover
- "AI Match" badge for models that work best with the product type
- Hover state shows full-body pose preview

**Model Comparison Mode** (optional toggle):
- Side-by-side comparison of 2-3 selected models
- Helps users decide between similar options

### 3. Pose Selection with Category Sections

Instead of a flat grid, organize poses by category:

```
Studio Shots (Best for e-commerce)
  [Front View] [Profile] [Back View]

Lifestyle (Best for social media)
  [Walking] [Seated] [Candid]

Editorial (Best for campaigns)
  [Dramatic] [High Fashion]

Streetwear (Best for urban brands)
  [Urban Lean] [Street Style]
```

Each section includes:
- Category header with use-case recommendation
- Horizontal scrollable row of poses
- Larger preview cards with description visible

### 4. Live Preview Composite

Add a real-time preview showing the selected combination:

```
+---------------------------+
|   PREVIEW                 |
|   +--------+  +--------+  |
|   |Product |  | Model  |  |
|   | Image  |  | Pose   |  |
|   +--------+  +--------+  |
|                           |
|   "Yuki in Studio Front   |
|    wearing Wool Sweater"  |
+---------------------------+
```

- Updates as user selects different options
- Shows product thumbnail + selected model + pose
- Descriptive text: "{Model} in {Pose} wearing {Product}"
- Credit cost reminder

### 5. Step Progress Enhancement

Replace the horizontal dots with a visual step tracker:

```
[1. Product] -----> [2. Model] -----> [3. Pose] -----> [4. Generate]
     Done            Current          Locked            Locked
```

- Completed steps show checkmark with thumbnail
- Current step is highlighted
- Future steps are grayed but visible
- Clickable to go back to previous steps

### 6. "Popular Combinations" Quick Start

For users who want speed:

```
Popular Looks for [Product Category]
+-------------+  +-------------+  +-------------+
| Yuki        |  | Amara       |  | Marcus      |
| Studio      |  | Lifestyle   |  | Streetwear  |
| Front       |  | Walking     |  | Urban       |
+-------------+  +-------------+  +-------------+
    Select          Select          Select
```

- Pre-configured model + pose combinations
- One-click to skip to settings
- Based on product category

---

## File Changes Summary

| File | Changes |
|------|---------|
| `src/components/app/GenerationModeToggle.tsx` | Complete redesign with visual cards, icons, and use-case descriptions |
| `src/components/app/ModelSelectorCard.tsx` | Enhanced with visible metadata, "AI Match" badge, larger hover preview |
| `src/components/app/PoseSelectorCard.tsx` | Larger cards with visible description, category color coding |
| `src/components/app/TryOnPreview.tsx` | New component - live preview composite |
| `src/components/app/ModelFilterBar.tsx` | New component - multi-filter toolbar |
| `src/components/app/PoseCategorySection.tsx` | New component - grouped pose sections |
| `src/components/app/PopularCombinations.tsx` | New component - quick-start presets |
| `src/pages/Generate.tsx` | Integration of all new components, improved step flow |
| `src/data/mockData.ts` | Add popular combinations data, AI match scores |

---

## Visual Design Principles

1. **Progressive Disclosure**: Show essential info upfront, details on hover/click
2. **Visual Consistency**: All cards follow the same design language as TemplatePreviewCard
3. **Shopify Native**: Use Polaris components where possible, maintain Shopify Admin aesthetics
4. **Accessibility**: All interactive elements have clear focus states and keyboard navigation
5. **Mobile-First**: Touch-friendly targets, swipeable carousels for poses

---

## Technical Implementation Notes

- New components use existing patterns from TemplatePreviewCard
- Filter state managed locally, no need for external state management
- Live preview is purely visual - no API calls until final generation
- All new components are fully typed with TypeScript interfaces
- Responsive grid layouts using Polaris InlineGrid

