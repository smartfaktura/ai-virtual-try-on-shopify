

# Fix Survey Card Background + Move to Image Detail View

## Two Issues

1. **Transparent background**: The `ContextualFeedbackCard` uses `bg-primary/5` which is nearly invisible when overlaying the image grid on Freestyle. Need to add a solid `bg-card` or `bg-background` to the card's banner class.

2. **Move survey to image lightbox**: Remove the survey from the prompt bar area in Freestyle.tsx and add it inside `LibraryDetailModal.tsx` after the Delete button. This ties the survey to the specific image being viewed, passing the correct `resultId` (image ID) and `imageUrl`.

## Changes

### `src/components/app/ContextualFeedbackCard.tsx` — Line 131

Change `bannerClass` from transparent to solid background:

```tsx
// Before
const bannerClass = 'bg-primary/5 border border-primary/20 rounded-xl px-4 py-3';

// After
const bannerClass = 'bg-card border border-primary/20 rounded-xl px-4 py-3';
```

### `src/pages/Freestyle.tsx` — Lines 1148-1161

Remove the `ContextualFeedbackCard` block and its surrounding wrapper div entirely. Also remove the `showFreestyleFeedback` state/logic and the import if no longer used elsewhere.

### `src/components/app/LibraryDetailModal.tsx` — After the Delete button (line 388)

Add the `ContextualFeedbackCard` between the Delete button section and the "Share to Explore" section, using the current `activeItem.id` as `resultId` and `activeItem.imageUrl` as `imageUrl`. The dismiss key will be per-image so it only shows once per image.

```tsx
{/* Survey feedback — per image */}
<ContextualFeedbackCard
  workflow="freestyle"
  questionText="How was this result?"
  buttonLabels={{ yes: 'Nailed it', almost: 'Almost', no: 'Not quite' }}
  reasonChips={['Prompt ignored', 'Product changed', 'Model/look off', 'Scene/style off', 'Bad composition', 'Not realistic', 'Low quality', 'Too slow']}
  textPlaceholder="What did you expect instead?"
  resultId={activeItem?.id}
  imageUrl={activeItem?.imageUrl}
  triggerType="result_ready"
/>
```

This ensures:
- Each image gets its own survey tied to its ID
- The feedback record stores the correct `result_id` and `image_url`
- The dismiss key is per-image (`vovv_fb_dismiss_freestyle_{imageId}`)

| File | Change |
|------|--------|
| `src/components/app/ContextualFeedbackCard.tsx` | Change `bg-primary/5` to `bg-card` in bannerClass |
| `src/pages/Freestyle.tsx` | Remove ContextualFeedbackCard from prompt bar area |
| `src/components/app/LibraryDetailModal.tsx` | Add ContextualFeedbackCard after Delete button, passing activeItem ID/URL |

