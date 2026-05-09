## Tiny update to force a fresh publish

Make a minimal, visible tweak to the Home & Furniture category page so the build hash changes and the next Publish/Update produces a new bundle.

### Change

In `src/data/aiProductPhotographyCategoryPages.ts`, on the `home-furniture` entry, lightly refine the hero subheadline copy (one-word polish, no punctuation added per brand rules) — e.g. tighten the intro sentence so the rendered HTML differs from the currently deployed version.

That's enough to invalidate the cached chunk and confirm whether Publish → Update actually ships new code.

### After you approve

1. I apply the copy tweak
2. You click Publish → Update
3. Hard refresh `vovv.ai/ai-product-photography/home-furniture`
4. We verify the new rooms/scenes appear (they're already in the code — this just forces a rebuild)

If the page still shows old content after this, it confirms a publish-pipeline issue rather than a code issue, and we escalate.