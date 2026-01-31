

# Expand E-commerce Product Library for Full Market Coverage

## Problem Summary
The app currently only has sample products for **clothing/athleisure** (8 Alo Yoga items). All other supported categories (Cosmetics, Food, Home, Supplements) have templates but **zero sample products** - making it impossible for merchants in those industries to demo the app properly.

---

## Solution Overview

### Part 1: Add Sample Products for Existing Categories (20 new products)

#### Cosmetics (5 products)
| Product | Type | Brand Style |
|---------|------|-------------|
| Vitamin C Brightening Serum | Serums | The Ordinary |
| Hydrating Hyaluronic Acid Cream | Moisturizers | CeraVe |
| Matte Liquid Lipstick | Lip Products | Fenty Beauty |
| Retinol Night Treatment | Treatments | Drunk Elephant |
| Setting Powder Compact | Face Powder | Charlotte Tilbury |

#### Food & Beverage (5 products)
| Product | Type | Brand Style |
|---------|------|-------------|
| Organic Granola Mix | Cereal | Bear Naked |
| Cold-Pressed Green Juice | Beverages | Pressed |
| Artisan Chocolate Bar | Confectionery | Hu Kitchen |
| Premium Coffee Beans | Coffee | Blue Bottle |
| Organic Honey Jar | Spreads | Bee & Flower |

#### Home & Interior (5 products)
| Product | Type | Brand Style |
|---------|------|-------------|
| Ceramic Pour-Over Carafe | Kitchen | Fellow |
| Soy Wax Candle | Candles | Byredo |
| Linen Throw Pillow | Textiles | Parachute |
| Concrete Planter | Planters | West Elm |
| Brass Table Lamp | Lighting | CB2 |

#### Supplements & Wellness (5 products)
| Product | Type | Brand Style |
|---------|------|-------------|
| Daily Multivitamin Gummies | Vitamins | Ritual |
| Collagen Peptides Powder | Collagen | Vital Proteins |
| Magnesium Sleep Capsules | Sleep | Moon Juice |
| Greens Superfood Blend | Greens | Athletic Greens |
| Omega-3 Fish Oil Softgels | Omega-3 | Nordic Naturals |

---

### Part 2: Generate Product Images (20 images)

Create professional product photography for each item:

```text
src/assets/products/
├── [EXISTING 9 clothing images]
├── serum-vitamin-c.jpg
├── cream-hyaluronic.jpg
├── lipstick-matte.jpg
├── retinol-treatment.jpg
├── powder-setting.jpg
├── granola-organic.jpg
├── juice-green.jpg
├── chocolate-artisan.jpg
├── coffee-beans.jpg
├── honey-organic.jpg
├── carafe-ceramic.jpg
├── candle-soy.jpg
├── pillow-linen.jpg
├── planter-concrete.jpg
├── lamp-brass.jpg
├── vitamins-gummy.jpg
├── collagen-powder.jpg
├── magnesium-capsules.jpg
├── greens-superfood.jpg
├── omega-fish-oil.jpg
```

---

### Part 3: Expand Product Type Detection

Update `Generate.tsx` to recognize more product keywords:

```text
Current Detection Keywords:
- Clothing: leggings, hoodie, t-shirt, sports bra, jacket, tank top, joggers, shorts, dress, sweater...

NEW Keywords to Add:
- Cosmetics: serum, moisturizer, lipstick, foundation, mascara, eyeshadow, cleanser, toner, essence, sunscreen, primer, concealer, blush, bronzer, highlighter
- Food: cereal, granola, chocolate, coffee, tea, honey, jam, sauce, snack, bar, cookie, candy, nuts, dried fruit
- Home: candle, vase, planter, pillow, blanket, lamp, clock, frame, mirror, rug, curtain, towel, mug, bowl, plate
- Supplements: vitamin, supplement, capsule, powder, gummy, protein, collagen, probiotic, omega, mineral, herb, extract
```

---

### Part 4: Add New Categories (Optional Expansion)

Consider adding 3 new high-demand categories:

| Category | Templates to Add | Sample Products |
|----------|------------------|-----------------|
| **Jewelry** | Elegant Studio, Lifestyle Wear, Detail Macro | Rings, Necklaces, Earrings |
| **Electronics** | Tech Clean, Lifestyle Context, Unboxing | Phone Cases, Headphones, Chargers |
| **Pet** | Studio Clean, Lifestyle Happy, Natural Outdoor | Pet Food, Toys, Accessories |

---

## Implementation Steps

### Step 1: Generate Product Images
Create 20 AI-generated product photos with:
- Clean white/gradient backgrounds
- Professional product photography lighting
- Consistent style matching existing clothing images

### Step 2: Update mockData.ts
- Import 20 new product images
- Add 20 new Product entries organized by category
- Ensure proper productType values for detection

### Step 3: Expand Detection Keywords
- Update `isClothingProduct()` function with more clothing terms
- Add detection functions for cosmetics, food, home, supplements
- Improve category auto-selection logic

---

## Files to Modify

**New files (20):**
- `src/assets/products/serum-vitamin-c.jpg`
- `src/assets/products/cream-hyaluronic.jpg`
- `src/assets/products/lipstick-matte.jpg`
- `src/assets/products/retinol-treatment.jpg`
- `src/assets/products/powder-setting.jpg`
- `src/assets/products/granola-organic.jpg`
- `src/assets/products/juice-green.jpg`
- `src/assets/products/chocolate-artisan.jpg`
- `src/assets/products/coffee-beans.jpg`
- `src/assets/products/honey-organic.jpg`
- `src/assets/products/carafe-ceramic.jpg`
- `src/assets/products/candle-soy.jpg`
- `src/assets/products/pillow-linen.jpg`
- `src/assets/products/planter-concrete.jpg`
- `src/assets/products/lamp-brass.jpg`
- `src/assets/products/vitamins-gummy.jpg`
- `src/assets/products/collagen-powder.jpg`
- `src/assets/products/magnesium-capsules.jpg`
- `src/assets/products/greens-superfood.jpg`
- `src/assets/products/omega-fish-oil.jpg`

**Files to update:**
- `src/data/mockData.ts` - Add imports and product entries
- `src/pages/Generate.tsx` - Expand detection keywords

---

## Result

After implementation:
- **28 total sample products** (8 clothing + 20 new)
- **4 product categories fully populated** with realistic demo products
- **Better category detection** for accurate template recommendations
- **Complete demo experience** for merchants across major e-commerce verticals

