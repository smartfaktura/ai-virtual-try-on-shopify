# Replace 5 reused placeholders with proper sub_family-specific scenes

Earlier seed reused close-relative placeholders for 5 sub_families because I hadn't found dedicated scenes. They exist — here are the right matches.

## Updates

| sub_family | Was | Now (correct) | Source scene |
|---|---|---|---|
| `fashion / lingerie` | Ghost Mannequin Garment | **Front View Lingerie** | `hard-shadow-garments-lingerie` |
| `fashion / streetwear` | Ghost Mannequin Hoodie | **Streetwear Studio** | `apparel-studio-fisheye-streetwear` |
| `jewelry / jewellery-earrings` | Front View Ring | **Earring Portrait** | `earring-touch-portrait` |
| `home / furniture` | Front View Home Decor | **Front View Furniture** | `furniture-front-view` |
| `food-drink / snacks-food` | Front View Food | **Front View Snack** | `snack-editorial-front-hero` |

## Execution

One `UPDATE` per row against `brand_scene_stock_products` matching `(module, sub_family)`. No code changes, no schema changes.

Approve and I'll run the 5 updates.
