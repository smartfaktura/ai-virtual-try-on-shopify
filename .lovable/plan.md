

## Fix Studio Chat: Freestyle Pricing & Recommendation Bias

### Problems
1. **Wrong pricing for Freestyle**: The system prompt lists "Standard quality: 8 credits" universally, but Freestyle actually costs **4 credits** (standard) and **10 credits** (high quality) — different from Workflow pricing.
2. **AI never recommends Freestyle**: Line 107 says "recommend the RIGHT workflow" which biases the AI to only suggest Workflows. Freestyle should be equally recommended when users want creative freedom, custom prompts, or cheaper generation.

### Changes — 1 file

**`supabase/functions/studio-chat/index.ts`** — Update SYSTEM_PROMPT:

#### 1. Split credit pricing into Workflow vs Freestyle sections
Replace the current flat pricing list with:

**Freestyle pricing:**
- Standard quality: **4 credits** per image
- High quality: **10 credits** per image

**Workflow pricing:**
- Standard quality: **8 credits** per image
- High quality: **16 credits** per image
- With AI model reference: **12 credits**
- Model + Scene combo: **15 credits**
- High-complexity: **20 credits**
- Virtual Try-On: **16 credits**

**Video:** 30 credits per video

#### 2. Update recommendation instruction
Change line 107 from "recommend the RIGHT workflow" to instruct the AI to recommend **either Freestyle or the right Workflow** depending on the user's needs:
- Freestyle → for open creative control, custom prompts, budget-conscious users (starts at just 4 credits)
- Workflows → for structured, guided generation with specific output styles

#### 3. Update the quick estimate
Change "~5 credits ≈ 1 standard image" to "starting from 4 credits in Freestyle, 8 in Workflows"

