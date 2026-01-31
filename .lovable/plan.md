
# Bulk Generation Integration į Product Selection

## Problema
Dabartinis "Bulk Generate" mygtukas yra atskiras entry point, kuris sukuria nereikalingą kompleksiškumą. Logiškiau integruoti multi-select tiesiai į produktų pasirinkimo žingsnį.

## Sprendimas
Pakeisti produktų picker'į, kad leistų pasirinkti vieną ARBA kelis produktus, ir automatiškai nukreipti į atitinkamą flow.

## UI Flow po pakeitimo

```text
┌─────────────────────────────────────────────────────────────┐
│  How do you want to start?                                   │
│                                                              │
│  ┌─────────────────────┐  ┌─────────────────────┐           │
│  │  From Product(s)    │  │  From Scratch       │           │
│  │  Select products    │  │  Upload your own    │           │
│  └─────────────────────┘  └─────────────────────┘           │
│                                                              │
│  [Continue]                                                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Select Product(s)                                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  [Search products...]                                 │   │
│  │                                                       │   │
│  │  ○ 1 selected = Single mode                          │   │
│  │  ○ 2-20 selected = Bulk mode (same settings for all) │   │
│  │                                                       │   │
│  │  [✓] Tank Top White     [ ] Leggings Black           │   │
│  │  [✓] Sports Bra         [ ] Hoodie Gray              │   │
│  │                                                       │   │
│  │  Selected: 2 products                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  [← Back]                          [Continue with 2 →]      │
└─────────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
     1 product                       2+ products
           │                               │
           ▼                               ▼
   [Single Flow]                   [Bulk Flow]
   (Template/Model...)             (Settings for all...)
```

## Techniniai pakeitimai

| Failas | Pakeitimas |
|--------|------------|
| `src/pages/Generate.tsx` | Pašalinti "Bulk Generate" mygtuką, pridėti multi-select logiką produktų žingsnyje |
| `src/components/app/SourceTypeSelector.tsx` | Pakeisti "From Product" į "From Product(s)" su description apie bulk |
| `src/components/app/ProductMultiSelect.tsx` | Panaudoti jau sukurtą komponentą produktų pasirinkimui |

## Detali implementacija

### 1. Atnaujinti `SourceTypeSelector.tsx`
- Pakeisti "From Product" label į "From Product(s)"
- Atnaujinti description: "Select one or multiple Shopify products"

### 2. Atnaujinti `Generate.tsx`
- Pašalinti "Bulk Generate" mygtuką iš source step
- Pakeisti `selectedProduct: Product | null` į `selectedProducts: Product[]`
- Produktų pasirinkimo žingsnyje naudoti `ProductMultiSelect` komponentą
- Po produktų pasirinkimo:
  - Jei `selectedProducts.length === 1` → tęsti single flow (template/model selection)
  - Jei `selectedProducts.length >= 2` → redirect į `/generate/bulk` su pasirinktais produktais

### 3. State perdavimas
- Perduoti pasirinktus produktus į BulkGenerate per URL state arba context
- Arba: integruoti bulk flow tiesiai į Generate.tsx kaip papildomą step variantą

## Privalumai

1. **Vienas entry point** - viskas prasideda nuo "From Product(s)"
2. **Intuityvus UX** - checkboxai produktų sąraše yra natūralus pattern
3. **Mažiau UI clutter** - nereikia atskiro "Bulk Generate" mygtuko
4. **Nuoseklus flow** - vartotojas pats pasirenka ar nori single ar bulk
