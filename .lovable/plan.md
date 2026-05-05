
# Add Real-World Scale Block to Front View Scarves Scene

## What
Inject a `[REAL-WORLD SCALE — CRITICAL]` directive into the Front View (`front-view-bags-scarves`) scene prompt. This block uses the `{{specification}}` token (which carries the product's physical dimensions) to render scarves at proportionally correct sizes in the frame, so a 50cm scarf looks visibly smaller than a 120cm scarf.

## Database Update (single scene)

Update `product_image_scenes` where `scene_id = 'front-view-bags-scarves'` to insert the following block after the existing `[DESIGN PATTERN FIDELITY — CRITICAL]` section and before `STRICT PRODUCT ACCURACY`:

```
[REAL-WORLD SCALE — CRITICAL]
Use {{specification}} as the exact physical size reference for the scarf.
The scarf must be rendered according to its real dimensions from {{specification}}.
Do NOT visually normalize all scarves to the same size.
- If {{specification}} says 120 cm x 120 cm, the scarf should appear large and fill approximately 85–90% of the frame width.
- If {{specification}} says 100 cm x 100 cm, it should fill approximately 75–80% of the frame width.
- If {{specification}} says 70 cm x 70 cm, it should fill approximately 60–65% of the frame width.
- If {{specification}} says 50 cm x 50 cm, it should fill approximately 45–50% of the frame width.
The same print on different scarf sizes must appear at different visual scales in the frame.
A smaller scarf must not be enlarged to look like a large scarf.
A larger scarf must not be reduced to look like a small scarf.
```

The rest of the prompt (composition, framing, lighting, background, output style) stays identical.

## Implementation
Single data UPDATE via the insert tool (not a schema migration — no table structure changes).
