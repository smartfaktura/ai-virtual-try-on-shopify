

## Add CompleteRegistration Pixel Event on Signup

### Why
The current Pixel setup covers the full purchase funnel (PageView → ViewContent → InitiateCheckout → Purchase) but misses `CompleteRegistration`, a standard Meta event that helps optimize ad campaigns targeting signups.

### Changes

**1. `src/lib/fbPixel.ts` — Add `trackCompleteRegistration` helper**
- New function: `trackCompleteRegistration(method?: string)` that calls `fbq('track', 'CompleteRegistration', { content_name: method })`

**2. `src/contexts/AuthContext.tsx` — Fire event after successful signup**
- In the `signUp` function, after a successful response (no error, user returned), call `trackCompleteRegistration('email')`
- Import the helper from `fbPixel.ts`

### Files Changed
| File | Change |
|------|--------|
| `src/lib/fbPixel.ts` | Add `trackCompleteRegistration` helper |
| `src/contexts/AuthContext.tsx` | Fire `CompleteRegistration` on successful signup |

