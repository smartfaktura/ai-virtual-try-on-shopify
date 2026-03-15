

## Fix: Virtual Try-On Set Incorrectly Redirects to Perspectives Page

### Root Cause
The `Virtual Try-On Set` workflow has `variation_strategy.type = 'angle'` in its `generation_config` in the database. The `Generate.tsx` page (lines 144-151) redirects **any** workflow with `variation_strategy.type === 'angle'` to `/app/perspectives`. This means clicking "Create Set" on Virtual Try-On sends you to the Perspectives page instead of the normal try-on wizard.

### Fix
Run a database migration to update the Virtual Try-On Set's `variation_strategy.type` from `'angle'` to an appropriate type (e.g. `'paired'` — since try-on pairs product + model + scene). No code changes needed.

| Change | Detail |
|--------|--------|
| DB migration | Update `workflows` row for Virtual Try-On Set: set `generation_config.variation_strategy.type` from `'angle'` to `'paired'` |

This is a single SQL update — no code files need to change.

