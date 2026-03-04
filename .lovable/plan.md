

## Fix Studio Chat: Split Pricing & Recommend Freestyle

### Problem
The system prompt still has flat pricing (line 126-134) without distinguishing Freestyle vs Workflow costs, and line 107 still says "recommend the RIGHT workflow" — biasing the AI to only suggest Workflows, never Freestyle.

### Changes — 1 file

**`supabase/functions/studio-chat/index.ts`**

**Line 107** — Replace the recommendation instruction:
```
When users ask about generating images, recommend EITHER Freestyle or the right Workflow depending on their needs:
- **Freestyle** → open creative control, custom prompts, budget-friendly (starts at just 4 credits!)
- **Workflows** → structured, guided generation with specific output styles (starts from 8 credits)
Don't say "generate images" generically — point them to Freestyle or a specific workflow.
```

**Lines 126-134** — Replace flat pricing with split tiers:
```
CREDIT PRICING — what things cost:

**Freestyle pricing** (open-ended prompt-based generation):
- Standard quality: **4 credits** per image
- High quality: **10 credits** per image

**Workflow pricing** (guided structured generation):
- Standard quality: **8 credits** per image
- High quality: **16 credits** per image
- With AI model reference: **12 credits** per image
- Model + Scene combo: **15 credits** per image
- High-complexity (custom model + custom scene): **20 credits** per image
- Virtual Try-On: **16 credits** per image

**Video**: **30 credits** per video

Freestyle is the most affordable way to generate — starting from just 4 credits per image. Workflows cost more but provide structured, repeatable results. Always mention BOTH options when users ask about pricing.
```

