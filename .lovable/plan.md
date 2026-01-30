
# "Generate from Scratch" Feature Implementation Plan

## Kas tai?

Nauja galimybė Generate puslapyje, leidžianti vartotojui:
1. **Įkelti nuotrauką iš kompiuterio** (ne iš esamo Shopify produkto)
2. **Sugeneruoti AI nuotraukas** (Virtual Try-On arba Product-Only mode)
3. **Priskirti sugeneruotas nuotraukas** prie pasirinkto Shopify produkto

## User Flow

```text
┌─────────────────────────────────────────────────────────────┐
│                  Step 1: Choose Source                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │ From Product     │    │ From Scratch     │               │
│  │ ─────────────    │    │ ─────────────    │               │
│  │ Select existing  │    │ Upload your own  │               │
│  │ Shopify product  │    │ image file       │               │
│  └──────────────────┘    └──────────────────┘               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Step 2: Upload Image (From Scratch)             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐                │
│  │  Drag & drop or click to upload         │                │
│  │  ─────────────────────────────────      │                │
│  │  Supports: JPG, PNG, WEBP (max 10MB)    │                │
│  └─────────────────────────────────────────┘                │
│                                                              │
│  [Preview of uploaded image]                                 │
│                                                              │
│  Product details (optional):                                 │
│  - Title: "My Custom Product"                                │
│  - Type: Leggings, Hoodie, etc.                             │
│  - Description: "Black yoga pants..."                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
       ┌──────────────────────────────────────────┐
       │         Normal Generation Flow           │
       │  (Mode → Model → Pose → Settings)        │
       └──────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Results Step (Modified)                     │
├─────────────────────────────────────────────────────────────┤
│  [Generated images...]                                       │
│                                                              │
│  ┌────────────────────────────────────────┐                 │
│  │ Assign to Shopify Product              │                 │
│  │ ────────────────────────────           │                 │
│  │ Select product: [Dropdown ▼]           │                 │
│  │   - Airlift High-Waist Legging         │                 │
│  │   - Alo Accolade Hoodie                │                 │
│  │   - Airlift Intrigue Bra               │                 │
│  │                                         │                 │
│  │ [Publish to Selected Product]           │                 │
│  └────────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

## Komponentai ir Pakeitimai

### 1. Naujas Source Type State
Pridėsiu naują state kintamąjį `sourceType`:
- `'product'` - dabartinis flow (pasirinkti iš produktų)
- `'scratch'` - naujas flow (įkelti nuotrauką)

### 2. Naujas Komponentas: `UploadSourceCard`
Drag-and-drop upload zona su:
- Failų priėmimas (JPG, PNG, WEBP)
- Preview įkeltos nuotraukos
- Galimybė pakeisti nuotrauką
- Maksimalus dydis: 10MB

### 3. Naujas Komponentas: `ProductAssignmentModal`
Modalas rezultatų puslapyje leidžiantis:
- Ieškoti produktų pagal pavadinimą
- Pasirinkti produktą kuriam priskirti nuotraukas
- Publish Add/Replace opcijos

### 4. Modifikuotas Flow
- **Step 1**: "Choose Source" - Product arba From Scratch
- **Step 2a** (From Scratch): Upload image + basic product info
- **Step 2b** (Product): Dabartinis produkto pasirinkimas
- **Rest**: Normalus generation flow
- **Results** (From Scratch): Produkto priskyrimo UI

### 5. Storage Bucket
Sukurti `scratch-uploads` bucket Lovable Cloud Storage, kad:
- Laikinai saugoti įkeltas nuotraukas
- Edge function galėtų pasiekti nuotraukos URL
- Automatinis valymas po 24h

---

## Techniniai Detaliai

### Nauji Tipai (`src/types/index.ts`)
```typescript
export type GenerationSourceType = 'product' | 'scratch';

export interface ScratchUpload {
  file: File;
  previewUrl: string;  // blob URL for display
  uploadedUrl?: string; // storage URL for AI
  productInfo: {
    title: string;
    productType: string;
    description: string;
  };
}
```

### Failai kuriuos reikės sukurti:
1. `src/components/app/SourceTypeSelector.tsx` - UI pasirinkti source type
2. `src/components/app/UploadSourceCard.tsx` - Upload drag-drop zona
3. `src/components/app/ProductAssignmentModal.tsx` - Priskirti prie produkto
4. `src/hooks/useFileUpload.ts` - Upload logika į storage
5. SQL migration: Storage bucket `scratch-uploads`

### Failai kuriuos reikės modifikuoti:
1. `src/pages/Generate.tsx` - Pridėti naujus step'us ir flow logiką
2. `src/types/index.ts` - Nauji tipai
3. `supabase/functions/generate-tryon/index.ts` - Palaikyti storage URLs

### Database / Storage
- Sukurti `scratch-uploads` public bucket
- RLS: Bet kas gali upload'inti (anonymous), bet tik skaityti po upload
- Automatinis cleanup per Supabase lifecycle rules

### Flow modifikacijos Generate.tsx
```typescript
// Nauji state
const [sourceType, setSourceType] = useState<'product' | 'scratch'>('product');
const [scratchUpload, setScratchUpload] = useState<ScratchUpload | null>(null);
const [assignToProduct, setAssignToProduct] = useState<Product | null>(null);

// Step flow:
// 'source' → 'upload' (if scratch) → 'mode' → 'model' → 'pose' → 'settings' → 'generating' → 'results'
```
