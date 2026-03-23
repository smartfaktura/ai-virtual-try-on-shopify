

# Add Recipe Strip Above Workflow Images in Modal

## Idea
Add a visual "recipe" row above each workflow thumbnail showing the ingredient images as small squares with rounded corners, connected by `+` icons, ending with `=` and the result image. This makes it immediately clear what inputs produce what output.

```text
[🧥] + [👤] + [📍] = [📸]
     Product  Model  Scene   Result
```

## Changes

### 1. `src/components/app/workflowAnimationData.tsx`

Add a new `recipe` field to each workflow scene definition containing ordered ingredient thumbnails and the result image:

```ts
recipe?: { image: string; label: string }[];  // ingredients
recipeResult?: string;  // the final output image
```

- **Virtual Try-On**: `[tryonProduct, tryonModel, tryonScene]` → `tryonResult`
- **Product Listing**: `[listingProduct]` + badge "30+ Scenes" → `listingResult`
- **Selfie / UGC**: `[ugcProduct, ugcModel]` → `ugcResult1`
- **Flat Lay**: `[flatProduct1, flatProduct2]` → `flatResult`
- **Mirror Selfie**: `[mirrorSelfieProduct, mirrorSelfieModel, mirrorSelfieScene]` → mirror result URL

Also update the `WorkflowScene` type in `WorkflowAnimatedThumbnail.tsx` to include `recipe` and `recipeResult` optional fields.

### 2. `src/components/app/WorkflowCardCompact.tsx`

When `modalCompact` is true and `scene.recipe` exists, render a recipe strip **above the thumbnail** (between the card top and the image container):

```tsx
{modalCompact && scene?.recipe && (
  <div className="flex items-center justify-center gap-1 px-2 py-2 bg-muted/30">
    {scene.recipe.map((item, i) => (
      <React.Fragment key={i}>
        {i > 0 && <Plus className="w-3 h-3 text-muted-foreground shrink-0" />}
        <div className="w-7 h-7 rounded-md overflow-hidden shrink-0 border border-border">
          <img src={item.image} alt={item.label} className="w-full h-full object-cover" />
        </div>
      </React.Fragment>
    ))}
    <span className="text-muted-foreground text-[10px] font-bold mx-1">=</span>
    <div className="w-7 h-7 rounded-md overflow-hidden shrink-0 border-2 border-primary/30">
      <img src={scene.recipeResult} className="w-full h-full object-cover" />
    </div>
  </div>
)}
```

- Small 28px square images with `rounded-md` corners
- `+` icons between ingredients, `=` before result
- Staggered fade-in animation for each element
- Remove the existing text-only ingredient strip (lines 66-81) since this replaces it

### Files
- `src/components/app/WorkflowAnimatedThumbnail.tsx` — add `recipe`/`recipeResult` to type
- `src/components/app/workflowAnimationData.tsx` — add recipe data to each scene
- `src/components/app/WorkflowCardCompact.tsx` — render recipe strip above thumbnail for modal cards, remove old text strip

