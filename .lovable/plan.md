## UpgradePlanModal copy + chip cleanup

`src/components/app/UpgradePlanModal.tsx`

### 1. Unify title/subtitle (lines 77–97)
Use the same short copy for both mobile and desktop in the default free state:
- Title → **`Keep creating with VOVV`**
- Subtitle → **`Pick a plan — better value as you scale`**

Apply to both the mobile branch (lines 88–93) and the desktop branch (lines 94–97). Leave the other states (`Out of credits`, `Only N credits left`, `Top up`, paid upgrade) untouched.

### 2. Remove plan chips (lines ~356–373)
Delete the `(p.planId === 'starter' || p.planId === 'growth' || p.planId === 'pro') && (() => { ... })()` block that renders the `Default Models & Scenes` / `Brand Models & Scenes NEW` pills. Each plan card keeps name, price, credit/images line, and the recommended badge — no extra chip row.

No other logic changes.