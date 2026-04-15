<final-text>
Fix both issues in 3 frontend files.

1. Stop the “zoomed” crop on workflow cards
- In `src/components/app/WorkflowAnimatedThumbnail.tsx`, revert carousel background optimization from `width: 600` back to quality-only, matching how the other cards work.
- Keep the preload-next-images logic so loading stays smoother.
- Also make carousel mode respect `scene.objectPosition`, just like the non-carousel workflow renderer already does.

2. Align Product Visuals data with the other cards
- In `src/components/app/workflowAnimationData.tsx`, keep the reduced 8-image set, but remove the width-based transform from `pvImages`.
- If needed, slightly relax the `750ms` interval after the crop fix so the carousel feels less frantic, but only if it still looks too aggressive.

Why this should fix it:
- The bad “zoom” started when width-based transformed URLs were added to carousel cards.
- The storage transform defaults to crop/cover behavior when width-only resizing is used, so the image is already cropped before the browser even applies `object-cover`.
- Other cards mostly use quality-only optimization, which is why they look normal.

3. Clean up the Freestyle Studio card
- In `src/components/app/FreestylePromptCard.tsx`, rework the mini demo to follow the landing-page composition more closely instead of the current compressed version.
- Reduce the large empty white area by giving the result zone visible structure from the start: placeholder/result card shells, tighter vertical spacing, and the same result-card styling used on the homepage.
- Rebalance chip/prompt sizing so the card feels premium instead of cramped.

Expected result
- Workflow card images stop looking artificially zoomed/cropped
- Product Visuals stays lighter than before without breaking framing
- Freestyle Studio looks intentional and polished instead of empty/awkward

Files to update
- `src/components/app/WorkflowAnimatedThumbnail.tsx`
- `src/components/app/workflowAnimationData.tsx`
- `src/components/app/FreestylePromptCard.tsx`
</final-text>