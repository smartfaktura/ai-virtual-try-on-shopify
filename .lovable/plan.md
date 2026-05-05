
# Fix In-Hand Studio Outfit + Close-Up Detail Texture for Scarves

## 1. In-Hand Studio — Add outfit_hint

Set `outfit_hint` on `in-hand-studio-bags-scarves` to:

> Elegant premium white soft bright aesthetic. Fashion-forward minimal styling — clean white or ivory top, delicate jewellery optional. Skin luminous, nails neutral. The outfit must never compete with the scarf.

This will override the standard outfit picker and lock the model styling to a clean white editorial look.

## 2. Close-Up Detail — Fix texture bias

The current prompt for `closeup-detail-bags-scarves` says "show the actual weave structure, thread count, and surface finish" which biases the AI toward rendering silk-like weave regardless of the actual material.

Replace that line with material-conditional language:

> Render the fabric as {{material}} — show the surface finish and texture that is physically accurate for {{material}}. Do NOT default to silk weave or any other assumed textile. If the product is cotton, show cotton fibre. If cashmere, show cashmere nap. If silk, show silk sheen. Match the ACTUAL material only.

Also update the closing lighting instruction from "revealing fabric weave, thread detail" to "revealing realistic textile depth and surface detail true to {{material}}".

## Implementation
Two UPDATE statements via the insert tool on `product_image_scenes`.
