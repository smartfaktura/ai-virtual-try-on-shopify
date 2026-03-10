

## Findings: Virtual Try-On Jobs & Credit Calculations on Dashboard

### 1. Virtual Try-On Jobs — Working Correctly
Try-on jobs ARE inserted into `generation_jobs` with a `workflow_id`, so they will appear in the Recent Jobs table. The query (`generation_jobs` with `workflows(name)` join) correctly picks them up. If none show in the screenshot, it's simply because none were generated recently enough to be in the top 5.

### 2. Credit Display — Correct (Shows Actual DB Values)
The dashboard shows `job.credits_used` directly from the database, which is set by the backend at generation time. This is accurate — it reflects what was actually charged.

### 3. Client vs Backend Pricing Mismatch (Bug)
There is a **significant discrepancy** between what the UI previews as cost and what the backend actually charges:

| Scenario | Client (`CreditContext.calculateCost`) | Backend (`enqueue-generation`) |
|---|---|---|
| Workflow / Try-On | Not handled specifically | **8 credits/image** |
| With model | **12 credits/image** | 8 credits/image |
| Model + scene | **15 credits/image** | 8 credits/image |
| Standard (no model) | **4 credits/image** | 4 credits/image |
| High quality (no model) | **10 credits/image** | 8 credits/image |

The user sees inflated cost estimates in the Generate UI, but the backend charges less. This means users think they're spending more than they actually are.

### 4. Old Credits in Screenshot
The values 10, 12, 36 visible in the screenshot are likely from jobs created under older pricing logic before it was simplified to 8/image.

### Plan: Fix Client-Side Cost Calculation

**File: `src/contexts/CreditContext.tsx`** — Update `calculateCost` to match the backend:

```typescript
// Current (wrong):
if (hasModel && hasScene) return count * 15;
if (hasModel) return count * 12;
return count * (quality === 'high' ? 10 : 4);

// Fixed (matches backend):
if (mode === 'virtual-try-on') return count * 8;
// Workflows always cost 8 (handled by caller context)
if (hasModel || hasScene) return count * 8;
return count * 4;
```

**File: `src/lib/dropCreditCalculator.ts`** — Update `getCostPerImage` to match:

```typescript
// Current (wrong): 20, 16, 8
// Fixed: always 8 for workflows
function getCostPerImage(): number {
  return 8;
}
```

This is a 2-file fix to align the UI cost preview with actual backend charging.

