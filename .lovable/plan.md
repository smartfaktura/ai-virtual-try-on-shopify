

## Fix: Realistic Time Estimates and Overtime Messaging

### Root Cause

The AI model (`gemini-3-pro-image-preview`) used for model-reference generations has a 90-second timeout. When it times out, the system retries automatically (up to 2 retries). This means worst case is ~3 minutes for a single image. This is inherent to the AI provider and cannot be reduced.

### What Changes

**1. Increase base estimates for model-reference generations**

The current formula underestimates because it doesn't account for the Pro model's slower speed or potential retries. Updated weights:

| Factor | Current | New |
|--------|---------|-----|
| Base | 15s | 20s |
| Per image | +10s | +12s |
| High quality (Pro) | +15s | +20s |
| Model reference | +10s | +30s (Pro model is much slower) |
| Scene reference | +5s | +8s |
| Product reference | +5s | +8s |
| 2+ references | +10s | +15s |

Example: Product + Model + 1 image + Standard quality = 20 + 12 + 30 + 8 + 15 = 85s, displayed as "~70-100 seconds"

**2. Add overtime messaging when estimate is exceeded**

When elapsed time passes the estimated range, instead of a frozen progress bar at 90%, show reassuring overtime messages:

- At 1x estimate: "Taking a bit longer than usual -- still working on it..."
- At 1.5x estimate: "Complex generation in progress -- your studio team is perfecting the details..."
- At 2x estimate: "Almost there -- high-quality results take a little extra time..."

The progress bar will slow down but continue crawling past 90% (caps at 95%) to maintain visual feedback.

**3. Show complexity breakdown chip**

Below the estimate, add a subtle line explaining WHY it takes longer:
- "Model reference adds processing time" (when model is selected)
- "Multiple references increase complexity" (when 2+ refs)

This sets expectations rather than leaving users wondering.

### Files Changed

- `src/components/app/QueuePositionIndicator.tsx` -- update `estimateSeconds()` weights, add overtime state and messaging, add complexity explanation text

### No other changes needed
- The meta is already being passed correctly from Freestyle.tsx and Generate.tsx
- No database or edge function changes
- No new dependencies

