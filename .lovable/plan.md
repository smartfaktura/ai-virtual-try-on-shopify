

## Update Freestyle Showcase Prompt Text

The prompt text needs to clearly describe the three result images so it feels like the prompt actually generated them.

The three images are:
1. **Studio Lookbook** — model on clean white studio background
2. **Café Lifestyle** — model sitting outdoors at a café table
3. **Golden Hour** — model from behind near raw concrete, urban setting

### File: `src/components/landing/FreestyleShowcaseSection.tsx` (line 10)

Replace the `PROMPT_TEXT` with a more descriptive version that matches all three outputs:

```typescript
const PROMPT_TEXT = 'White Crop Top on three models: clean studio with white background, outdoor café seated at a wooden table, and urban concrete setting shot from behind...';
```

Also update the `RESULT_CARDS` labels (lines 38-42) to match the new descriptions:

```typescript
const RESULT_CARDS = [
  { label: 'Studio White', src: '/images/try-showcase/studio-lookbook.png' },
  { label: 'Outdoor Café', src: '/images/try-showcase/cafe-lifestyle.png' },
  { label: 'Urban Concrete', src: '/images/try-showcase/golden-hour.png' },
];
```

No other files change.

