

## Update Pricing Plan Features — Virtual Try-On for All Plans

The user wants two changes:
1. **Remove "Try-On mode"** from the Starter plan (line 1446) since Virtual Try-On is included in all plans
2. **Add "Virtual Try-On"** to the Free plan's feature list (and ensure it's listed on all plans consistently)

Since all workflows (including Virtual Try-On) are available to all plans, the feature lists should reflect this consistently.

### Changes in `src/data/mockData.ts`

**Free plan** (line 1425-1432): Replace `'All workflows'` with `'All workflows incl. Virtual Try-On'` to make it explicit.

**Starter plan** (line 1441-1449): Remove the `'Try-On mode'` line entirely — it's redundant since all plans include it. Add `'All workflows incl. Virtual Try-On'` in its place to match Free.

**Growth plan** (line 1460-1468): Add `'All workflows incl. Virtual Try-On'` as first feature (before Batch generation) for consistency.

**Pro plan** (line 1482-1491): Add `'All workflows incl. Virtual Try-On'` as first feature for consistency.

This makes it clear across all plans that Virtual Try-On is universally included, while removing the misleading "Try-On mode" from Starter that implied it was a paid upgrade.

