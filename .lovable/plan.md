

# Kive-Style Credit Inflation: Profitable Pricing for VOVV.AI

## The Kive Trick (What You Spotted)

Kive charges **$40/mo for 2,000 credits** -- sounds generous. But each image costs **4-20 credits**. So 2,000 credits = only 100-500 images. The big number creates a perception of value while keeping margins healthy.

Your current model: 1 credit = 1 standard image. That's too transparent and makes the numbers look small (100 credits at $9 feels stingy).

**The fix: inflate credit costs per action, then give bigger credit numbers at higher prices.**

---

## Your Hard Constraint

- **CAC (Customer Acquisition Cost): $35 per user**
- You need to recover that within 2 months max
- That means minimum ~$17.50/month gross profit per user

---

## Your Real Costs Per Generation

| Action | Model Used | Your Cost |
|---|---|---|
| Standard image | gemini-2.5-flash-image | ~$0.06 |
| High-quality image | gemini-3-pro-image-preview | ~$0.22 |
| Virtual Try-On | gemini-2.5-flash-image (2 imgs) | ~$0.08 |
| Video 5s standard | Kling std | ~$0.28 |
| Video 5s pro | Kling pro | ~$0.98 |
| Video 10s standard | Kling std | ~$0.56 |
| Video 10s pro | Kling pro | ~$1.96 |

---

## New Credit System (Kive-Style Inflation)

**Multiply all credit costs by 4x:**

| Action | Old Credits | New Credits | Your Cost | Cost per Credit |
|---|---|---|---|---|
| Standard image | 1 | 4 | $0.06 | $0.015 |
| High-quality image | 2 | 10 | $0.22 | $0.022 |
| Virtual Try-On (std) | 3 | 8 | $0.08 | $0.010 |
| Virtual Try-On (HQ) | -- | 15 | $0.25 | $0.017 |
| Video 5s standard | -- | 30 | $0.28 | $0.009 |
| Video 5s pro | -- | 60 | $0.98 | $0.016 |
| Video 10s standard | -- | 50 | $0.56 | $0.011 |
| Video 10s pro | -- | 100 | $1.96 | $0.020 |

**Blended average cost per credit: ~$0.015**

Now we can give users "1,000 credits" which sounds like Kive, but it's really ~250 standard images or ~100 HQ images.

---

## New Subscription Plans

| Plan | Price | Credits | What Users Actually Get | Your COGS (at 60% use) | Gross Profit | Margin |
|---|---|---|---|---|---|---|
| Free | $0 | 20 (once) | ~5 standard images | ~$0.30 | -- | Acquisition |
| Starter | $39/mo | 1,000 | ~250 std OR ~100 HQ | $9.00 | **$30.00** | **77%** |
| Growth | $79/mo | 2,500 | ~625 std OR ~250 HQ | $22.50 | **$56.50** | **72%** |
| Pro | $179/mo | 6,000 | ~1,500 std OR ~600 HQ | $54.00 | **$125.00** | **70%** |
| Enterprise | Custom | Custom | Negotiated | -- | -- | 50%+ |

### CAC Payback Math

- **Starter ($39)**: $30 profit/month --> payback $35 CAC in **1.2 months**
- **Growth ($79)**: $56.50 profit/month --> payback $35 CAC in **0.6 months**
- **Pro ($179)**: $125 profit/month --> payback $35 CAC in **0.3 months**

### Even at 100% Credit Utilization (Worst Case)

| Plan | Price | COGS (100% use) | Profit | Margin |
|---|---|---|---|---|
| Starter | $39 | $15.00 | $24.00 | 62% |
| Growth | $79 | $37.50 | $41.50 | 53% |
| Pro | $179 | $90.00 | $89.00 | 50% |

**Every plan stays profitable even if users consume every single credit.** No more negative margin scenarios.

### Annual Pricing (20% discount)

| Plan | Monthly | Annual (per month) | Annual Total |
|---|---|---|---|
| Starter | $39 | $31 | $372 |
| Growth | $79 | $63 | $756 |
| Pro | $179 | $143 | $1,716 |

---

## New Top-Up Packs (Always Profitable)

| Pack | Credits | Price | Per Credit | Your Cost (60% use) | Margin |
|---|---|---|---|---|---|
| Boost | 500 | $15 | $0.030 | $4.50 | 70% |
| Studio | 1,500 | $39 | $0.026 | $13.50 | 65% |
| Scale | 4,000 | $89 | $0.022 | $36.00 | 60% |

Top-ups are always more expensive per credit than subscription plans, incentivizing upgrades.

---

## Feature Gating

| Feature | Free | Starter | Growth | Pro |
|---|---|---|---|---|
| Standard generation | Yes | Yes | Yes | Yes |
| High-quality generation | -- | Yes | Yes | Yes |
| Virtual Try-On | -- | -- | Yes | Yes |
| Video generation | -- | -- | Yes | Yes |
| Brand Profiles | 1 | 3 | 10 | Unlimited |
| Creative Drops | -- | -- | Monthly | Weekly |
| Bulk Generation | -- | -- | Yes | Yes |
| Freestyle Studio | -- | Yes | Yes | Yes |
| API access | -- | -- | -- | Yes |
| Priority support | -- | -- | Yes | Yes |

---

## Monthly Projection at 500 Users

Distribution: 35% Starter, 45% Growth, 15% Pro, 5% Free

```text
Revenue:
  175 Starter x $39             =   $6,825
  225 Growth x $79              =  $17,775
  75 Pro x $179                 =  $13,425
  Top-ups (~15% of users)       =   $3,500
  Total                         =  $41,525

Costs (at 60% utilization):
  Starter: 175 x 600cr x $0.015 =  $1,575
  Growth: 225 x 1500cr x $0.015 =  $5,063
  Pro: 75 x 3600cr x $0.015     =  $4,050
  Video/HQ premium reserve      =  $1,000
  Infrastructure                =    $200
  Total COGS                    =  $11,888

Gross Profit                    =  $29,637 (71% margin)

Operating:
  Ads (50 new users x $35 CAC)  =  -$1,750
  Tools/operations              =  -$1,000

Net Monthly Contribution        =  $26,887
```

---

## vs Kive Side-by-Side Comparison

| | Kive Basic | VOVV Starter | Kive Pro | VOVV Growth |
|---|---|---|---|---|
| Price | $40/mo | $39/mo | $100/mo | $79/mo |
| Credits | 2,000 | 1,000 | 5,000 | 2,500 |
| Images (approx) | 100-500 | ~250 | 250-1,250 | ~625 |
| Try-On | No | No | No | **Yes** |
| Video | Yes | No (Growth+) | Yes | **Yes** |
| Brand Profiles | Limited | 3 | Unlimited | 10 |
| AI Studio Team | No | **Yes** | No | **Yes** |

VOVV is competitively priced: slightly cheaper than Kive with unique features (Try-On, AI Studio Team, Creative Drops) as upgrade drivers.

---

## What Users See on the UI

When generating, users see credit costs like:
- "4 credits" for a standard image (instead of "1 credit")
- "10 credits" for high-quality (instead of "2 credits")
- "8 credits" for try-on (instead of "3 credits")

And their plan shows "1,000 credits/month" which psychologically feels generous -- the same trick Kive uses.

---

## Files to Update

### 1. `src/data/mockData.ts` (lines 1839-1927)

Update `pricingPlans` array:
- Starter: $39/mo, $372/yr, 1000 credits
- Growth: $79/mo, $756/yr, 2500 credits (highlighted, "Most Popular")
- Pro: $179/mo, $1716/yr, 6000 credits
- Enterprise: unchanged
- Update all feature lists to reflect gating

Update `creditPacks` array:
- Pack 1: 500 credits, $15, $0.030/credit
- Pack 2: 1500 credits, $39, $0.026/credit, popular: true
- Pack 3: 4000 credits, $89, $0.0223/credit

### 2. `src/contexts/CreditContext.tsx`

Update `calculateCost` function (line 108-114):
- Standard: `count * 4` (was `count * 1`)
- High quality: `count * 10` (was `count * 2`)
- Virtual Try-On: `count * 8` (was `count * 3`)
- Add video mode: `count * 30` (base)
- Update `LOW_CREDIT_THRESHOLD` from 50 to 200
- Update `CRITICAL_THRESHOLD` from 10 to 40

### 3. `src/types/index.ts`

- Add `'video'` to `GenerationMode` type
- Free signup credits: change from 5 to 20 in relevant places

### 4. `src/components/app/GenerationModeToggle.tsx` (line 21-22)

- Product Shot: change `'1-2 credits/image'` to `'4-10 credits/image'`
- Virtual Try-On: change `'3 credits/image'` to `'8-15 credits/image'`

### 5. `src/components/app/GenerationModeCards.tsx` (lines 32, 65)

- Product Photos: `'1-2 credits per image'` to `'4-10 credits per image'`
- Virtual Try-On: `'3 credits per image'` to `'8-15 credits per image'`

### 6. `src/components/app/GenerateConfirmModal.tsx` (line 40)

- Change: `const creditsPerImage = quality === 'high' ? 2 : 1;`
- To: `const creditsPerImage = quality === 'high' ? 10 : 4;`

### 7. `src/components/app/TryOnConfirmModal.tsx` (line 42)

- Change: `const creditsPerImage = 3;`
- To: `const creditsPerImage = 8;`

### 8. `src/pages/Generate.tsx` (line 415)

- Change credit calculation from `3` / `2` / `1` to `8` / `10` / `4`

### 9. `src/pages/Freestyle.tsx` (line 78)

- Change: `const creditCost = imageCount * (quality === 'high' ? 2 : 1);`
- To: `const creditCost = imageCount * (quality === 'high' ? 10 : 4);`

### 10. `src/components/app/freestyle/FreestyleSettingsChips.tsx` (lines 186-187)

- Change `'1 credit per image'` to `'4 credits per image'`
- Change `'2 credits per image'` to `'10 credits per image'`

### 11. `src/components/app/BulkSettingsCard.tsx` (lines 90, 97)

- Change `'~1 credit/image'` to `'~4 credits/image'`
- Change `'~3 credits/image'` to `'~8 credits/image'`

### 12. `src/types/bulk.ts` (line 75)

- Change: `const creditsPerImage = mode === 'virtual-try-on' ? 3 : 1;`
- To: `const creditsPerImage = mode === 'virtual-try-on' ? 8 : 4;`

### 13. `src/components/app/WorkflowCard.tsx` (line 80)

- Change `* 3` to `* 8` and `* 2` to `* 4` for credit display

### 14. `src/components/app/CompetitorComparison.tsx`

- Update prices: VOVV.AI `$0.04`, Competitor A `$0.08`, Competitor B `$0.12`
- Update savings text accordingly

### 15. `src/pages/Settings.tsx`

- Line 53: `creditsTotal` from 1000 to 2500 (Growth plan)
- Line 245: Update quality labels to `'Standard (4 credits/image)'` and `'High (10 credits/image)'`
- Line 268: Update `'500 credits/month'` to `'2,500 credits/month'`

### 16. `src/components/landing/LandingPricing.tsx` (line 84)

- Change divisor from 20 to 40 for "visual sets" calculation (since each set now costs more credits)

### 17. Free signup credits

- Update from 5 to 20 wherever the free credits value is set (database default on profiles table, any hardcoded references)
- 20 free credits = 5 standard images (same as before, but the number "20" looks more generous)
