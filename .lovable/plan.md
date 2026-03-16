

## Shorten all custom scene descriptions to 5-7 words

### Problem
The custom scenes pulled from the database have descriptions that are too long (full sentences like "Warm, intimate evening cafe with strung lights and soft, inviting ambiance perfect for fashion"). The hardcoded `mockTryOnPoses` already have short 5-7 word descriptions — the custom scenes need to match.

### Change
Run a single database migration to UPDATE the `description` column on every row in `custom_scenes` to a concise 5-7 word phrase. This covers all ~60+ custom scenes. No code changes needed — the descriptions are rendered as-is from the DB.

**Examples of before → after:**

| Scene | Before | After |
|-------|--------|-------|
| 1990s Disposable Camera | Warm, intimate evening cafe with strung lights and soft, inviting ambiance... | Retro café with warm string lights |
| Amber Glow Studio | Dramatic warm light contrasts a cool blue background... | Warm light on cool blue backdrop |
| Clean White Studio | Bright, even studio lighting with a seamless white background... | Clean white seamless studio backdrop |
| Crimson Spotlight | A striking red studio environment with dramatic, directional lighting... | Bold red studio with dramatic light |
| Dark Rock Display | Product presented on textured dark rocks, dramatic lighting... | Textured dark rocks with moody light |
| Cloudy Sky Dream | Product nestled in soft clouds under a dramatic blue sky... | Dreamy clouds under dramatic blue sky |
| Industrial Concrete | A dark, moody studio environment with subtle lighting... | Dark moody studio with concrete elements |
| Elegant Vanity Setup | Luxurious, bright, and clean environment with soft, natural lighting... | Luxurious vanity with soft natural light |
| Golden Radiance Product | Dynamic, high-contrast lighting on a metallic gradient background... | Metallic gradient with golden highlights |

All ~60+ scenes will be updated in a single SQL `UPDATE ... CASE` statement.

