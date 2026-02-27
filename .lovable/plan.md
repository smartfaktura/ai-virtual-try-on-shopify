

## Add Spatial Safety Rules to Interior Staging Prompts

### Problem
The AI staging engine can place furniture that blocks doorways, hallways, windows, and other functional openings because the prompt doesn't include spatial-awareness constraints.

### Solution
Add explicit spatial rules to the interior design prompt in the `generate-workflow` edge function. This is a prompt-only change -- no UI modifications needed.

### File: `supabase/functions/generate-workflow/index.ts`

Update the `CRITICAL REQUIREMENTS` section in the interior workflow prompt (around line 312) to add spatial-awareness rules:

**Current:**
```
CRITICAL REQUIREMENTS:
1. The room architecture MUST remain EXACTLY as shown in [PRODUCT IMAGE] — same windows, doors, walls, angles, perspective.
2. The camera viewpoint must NOT change at all.
3. Ultra high resolution, photorealistic quality, no AI artifacts, proper shadows and lighting.
4. This specific variation must clearly match the "[variation]" interior design style described above.
5. All furniture must have correct perspective and scale for the room.
```

**Updated (add rules 6-8):**
```
CRITICAL REQUIREMENTS:
1. The room architecture MUST remain EXACTLY as shown in [PRODUCT IMAGE] — same windows, doors, walls, angles, perspective.
2. The camera viewpoint must NOT change at all.
3. Ultra high resolution, photorealistic quality, no AI artifacts, proper shadows and lighting.
4. This specific variation must clearly match the "[variation]" interior design style described above.
5. All furniture must have correct perspective and scale for the room.
6. NEVER block doorways, hallways, corridors, or room entrances with furniture. All passage areas must remain fully clear and walkable.
7. Do NOT place furniture in front of windows, radiators, air vents, electrical panels, or fire exits.
8. Maintain realistic traffic flow — leave clear walking paths between furniture groupings (minimum ~60 cm / 2 ft clearance).
```

Also add to the `AVOID` / negative prompt section for interior workflows:
- "furniture blocking doorways, blocked hallways, obstructed entrances, furniture in front of windows, unrealistic furniture placement"

This is a single-file change to the edge function prompt logic only.
