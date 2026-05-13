## Plan

1. **Update all padel scene records in the database**
   - Add a dedicated `outfit_hint` to every padel scene so the Product Visuals outfit system no longer auto-fills generic sneaker presets.
   - The outfit hint will explicitly require logo-free padel/tennis court shoes, low white ankle socks, and a clean fashion-forward padel outfit around the uploaded product.

2. **Strengthen the padel footwear wording inside each scene prompt**
   - Replace the current generic footwear line with a stricter shape/spec directive:
     - low-cut tennis/padel court shoe shape
     - reinforced rounded toe cap
     - lateral side-support panels
     - firm non-marking flat court sole
     - herringbone/clay-court tread
     - padded collar and stable heel counter
     - white/cream palette, no logos or text
   - Add clear negatives: no running shoes, knit sock runners, chunky lifestyle sneakers, basketball shoes, platform sneakers, sandals, or fashion trainers.

3. **Add a backend prompt safeguard for padel scenes**
   - In the product image prompt builder, detect `scene.id` containing `padel` and append a final `PADEL FOOTWEAR VALIDATION` block after normal prompt assembly.
   - This repeats the shoe requirement at the end of the final prompt, where the image model is less likely to ignore it.

4. **Verify the final prompt path**
   - Check that selected padel scenes now carry `outfitHint` from the database into the frontend.
   - Confirm the generated final instruction includes both the padel scene `FOOTWEAR` block and the new final validation block before asking you to regenerate.