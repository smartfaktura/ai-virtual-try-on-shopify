
User wants me to verify the previous claim about analysis caching with actual code/DB checks, then plan a fix if needed.

What I'll verify:
1. Does `analyze-product-category` edge function write `version: 2` into the response?
2. Does `useProductAnalysis.analyzeProducts` correctly skip cached items?
3. Is `analysis_json` actually getting persisted in the DB?

Looking at the hook code already in context:
- Line ~37: `if (existing?.category && existing?.version === 2)` → cached
- Line ~95-100: persists to `user_products.analysis_json` after fresh analysis
- Session dedup via `analyzedOrInflight` ref

Risk areas to confirm:
- Does the edge function actually return `version: 2` in `data.analysis`? If not, **nothing gets cached** — every session re-analyzes.
- Are there real rows with `analysis_json` populated in DB?

If both check out → no code changes needed, just confirm. If edge function is missing `version: 2` → 1-line fix.
