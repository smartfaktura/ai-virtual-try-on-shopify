

## Fix: Workflow credit cost not accounting for quality setting

### Problem

The "Product Listing Set" workflow allows choosing Standard or High quality, but credits are always calculated at 8 per image (the High rate). Standard should cost 4 credits per image, High should cost 8.

Two hardcoded `* 8` values need to become quality-aware:

### Changes

**1. `src/pages/Generate.tsx` (line 1558)**

Replace the hardcoded `* 8` in the `singleProductCreditCost` calculation with a quality-based multiplier:
- `quality === 'high' ? 8 : 4`
- This applies to the `hasWorkflowConfig` branch (workflow jobs)

**2. `src/components/app/generate/WorkflowSettingsPanel.tsx` (line 766)**

Replace the hardcoded `× 8 credits` display text with a dynamic value based on the `quality` prop:
- `× ${quality === 'high' ? 8 : 4} credits`

Both are single-line changes. The flat-lay cost summary on line 612 already correctly uses `quality === 'high' ? 16 : 8`, so that path is fine.

