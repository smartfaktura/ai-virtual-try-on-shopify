# Sub-family stock products for Brand Scene previews

Add one specific stock product placeholder per sub_family across all 12 modules, so the Step 6 preview shows the *right* kind of product (caps for caps, beanies for beanies, sneakers for sneakers, etc.) instead of the module-level generic.

No schema changes, no code changes — pure data seed into the existing `brand_scene_stock_products` table. Module-level fallbacks already in place stay as the safety net for any unseeded sub_family.

## Seed plan — one row per sub_family

All `image_url` values are pulled from existing canonical `front-view-*` / `ghost-mannequin-*` scene previews in `product_image_scenes`.

### Fashion (9 sub_families)
| sub_family | placeholder | source scene |
|---|---|---|
| garments | Ghost Mannequin Garment | `ghost-mannequin-clothing` |
| hoodies | Ghost Mannequin Hoodie | `ghost-mannequin-hoodies` |
| dresses | Ghost Mannequin Dress | `ghost-mannequin-dresses` |
| jeans | Ghost Mannequin Jeans | `ghost-mannequin-jeans` |
| jackets | Ghost Mannequin Jacket | `ghost-mannequin-jackets` |
| activewear | Ghost Mannequin Activewear | `ghost-mannequin-activewear` |
| swimwear | Ghost Mannequin Swimwear | `ghost-mannequin-swimwear` |
| lingerie | Ghost Mannequin Garment *(reuses clothing)* | `ghost-mannequin-clothing` |
| streetwear | Ghost Mannequin Hoodie *(reuses hoodie)* | `ghost-mannequin-hoodies` |

### Footwear (4)
| shoes | Front View Shoe | `front-view-shoes` |
| sneakers | Front View Sneaker | `front-view-shoes-sneakers` |
| boots | Front View Boot | `front-view-shoes-boots` |
| high-heels | Front View High Heel | `front-view-shoes-highheels` |

### Bags & Accessories (5)
| bags-accessories | Front View Bag | `front-view-bags` |
| backpacks | Front View Backpack | `front-view-bags-backpacks` |
| wallets-cardholders | Front View Wallet | `front-view-bags-wallets` |
| belts | Front View Belt | `front-view-bags-belts` |
| scarves | Front View Scarf | `front-view-bags-scarves` |

### Hats, Caps & Beanies (3)
| caps | Front View Cap | `front-view-hats` |
| hats | Front View Hat | `front-view-hats-hats` |
| beanies | Front View Beanie | `front-view-hats-beanies` |

### Watches (1)
| watches | Front View Watch | `front-view-hats-watches` |

### Eyewear (1)
| eyewear | Front View Eyewear | `front-view-hats-eyewear` |

### Jewelry (4)
| jewellery-rings | Front View Ring | `front-view-bags-jring` |
| jewellery-necklaces | Front View Necklace | `front-view-bags-jneck` |
| jewellery-bracelets | Front View Bracelet | `front-view-bags-jbrace` |
| jewellery-earrings | Front View Ring *(reuses ring — no earring scene yet)* | `front-view-bags-jring` |

### Beauty & Fragrance (3)
| beauty-skincare | Front View Skincare | `front-view-beauty` |
| makeup-lipsticks | Front View Makeup | `front-view-makeup` |
| fragrance | Front View Fragrance | `clean-packshot-fragrance` |

### Home (2)
| home-decor | Front View Home Decor | `front-view-home` |
| furniture | Front View Home Decor *(reuses decor — no furniture scene yet)* | `front-view-home` |

### Tech (1)
| tech-devices | Front View Tech Device | `front-view-tech` |

### Food & Drink (3)
| food | Front View Food | `front-view-food-only` |
| beverages | Front View Beverage | `front-view-bev` |
| snacks-food | Front View Food *(reuses food — no snack scene yet)* | `front-view-food-only` |

### Wellness (1)
| supplements-wellness | Front View Supplements | `front-view-supplements` |

**Total: 37 sub_family rows** added on top of the existing 12 module-level fallbacks.

## How resolution works after the seed

`useStockProductForScene(module, sub_family)` already does:

1. exact `(module, sub_family)` match — now hits for every sub_family above
2. module-level fallback (`sub_family IS NULL`) — still covers any new sub_family that gets added later
3. null — silent fallback to current empty-environment behavior

No edge-function, hook, wizard, or UI changes needed.

## Reused placeholders (flagged honestly)

These five sub_families get a *close-relative* placeholder rather than a perfect match because no canonical scene exists yet:

- `lingerie` → ghost-mannequin garment
- `streetwear` → ghost-mannequin hoodie
- `jewellery-earrings` → ring close-up
- `furniture` → home decor
- `snacks-food` → food packshot

When admins later upload dedicated previews for those, a single `UPDATE` swaps the row — no code touch.

## Out of scope

- Building an admin UI for `brand_scene_stock_products` (still seed-only)
- Generating new canonical packshots for the 5 reused slots
- Any change to the preview pipeline, prompt, or save flow

## Files touched

```
Data only — one INSERT batch into brand_scene_stock_products
```

Approve and I'll run the seed in a single insert call.
