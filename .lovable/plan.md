

# Update Perspectives Card Animation Images

## What
Replace the 4 current placeholder PNG images in the "Picture Perspectives" carousel animation with the 6 uploaded real perspective photos, and update the badge copy.

## Steps

### 1. Copy uploaded images to `public/images/perspectives/`
Save the 6 uploaded JPGs as `VOVVAI-Perspectives-1.jpg` through `VOVVAI-Perspectives-6.jpg` in `public/images/perspectives/`.

### 2. Update `src/components/app/workflowAnimationData.tsx`
In the `'Picture Perspectives'` entry (~line 201):
- Change `background` to use `VOVVAI-Perspectives-1.jpg`
- Replace the `backgrounds` array with all 6 images
- Update badge from `'1 Photo, 4 Angles'` → `'1 Photo, Endless Angles'`
- Update second badge from `'One Click'` → `'No Reshoots Needed'`

## Files

| File | Change |
|------|--------|
| `public/images/perspectives/` | 6 new JPGs from uploads |
| `src/components/app/workflowAnimationData.tsx` | Update backgrounds array and badge labels |

