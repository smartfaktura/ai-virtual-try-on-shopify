

## Enhance Studio Chat with Pricing, Credits & Upgrade Knowledge

### Problem
The AI assistant has no knowledge of credit costs, subscription plans, pricing, or how to help users with credit-related questions. It can't suggest upgrades or explain what things cost.

### Changes — 1 file

**`supabase/functions/studio-chat/index.ts`** — Expand `SYSTEM_PROMPT` with three new knowledge sections:

#### 1. Credit Pricing Table
Add exact per-image credit costs so the AI can answer "how much does X cost?":
- Standard quality: **4 credits** per image
- High quality (Pro model): **10 credits** per image
- With AI model: **12 credits** per image
- Model + Scene: **15 credits** per image
- Virtual Try-On: **8 credits** per image
- Video generation: **70-90 credits** per video (5s), double for 10s
- Rule of thumb: ~5 credits = 1 image (for estimates)

#### 2. Subscription Plans
Add plan details so the AI can recommend upgrades contextually:
- **Free**: 20 credits, all workflows, 1 brand profile, 1 product
- **Starter** ($39/mo): 500 credits (~100 images), Try-On, 3 profiles, 10 products
- **Growth** ($79/mo, most popular): 1,500 credits (~300 images), priority queue, 10 profiles, 100 products
- **Pro** ($179/mo): 4,500 credits (~900 images), Creative Drops, unlimited profiles & products
- **Enterprise**: Custom pricing, unlimited, dedicated account manager
- Annual billing saves 17%

#### 3. Top-Up Packs
- 200 credits — $15
- 500 credits — $29 (best value)
- 1,500 credits — $69

#### 4. Upgrade CTA & Credit Help Rules
Add behavioral instructions:
- When a user mentions running low on credits, being out of credits, or asks about pricing → explain costs and suggest the right plan or top-up
- Add CTA: `[[Upgrade Plan|/app/settings]]` for plan changes, `[[Buy Credits|/app/settings]]` for top-ups
- Never push upgrades unprompted — only when the user asks about pricing, credits, or limits
- When recommending a plan, compare to their implied usage (e.g., "if you generate ~50 images/week, Growth gives you 300/month")

