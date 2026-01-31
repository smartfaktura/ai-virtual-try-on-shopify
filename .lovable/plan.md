
# Bulk Generation Feature - Detalus Planas

## Funkcionalumo Apžvalga

Bulk Action leidžia vartotojui pasirinkti kelis produktus ir sugeneruoti nuotraukas visiems vienu metu, naudojant tas pačias nustatymus (template/model/pose). Sistema apdoroja produktus **eilės tvarka (sequential queue)**, kad neapkrautų API ir nepasiektu rate limit.

## Architektūros Schema

```text
┌─────────────────────────────────────────────────────────────┐
│                     BULK GENERATION FLOW                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. PRODUCT SELECTION                                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  [ ] Product A    [ ] Product B    [✓] Product C     │   │
│  │  [✓] Product D    [ ] Product E    [✓] Product F     │   │
│  │                                                      │   │
│  │  Selected: 3 products                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           ▼                                  │
│  2. BULK SETTINGS                                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Mode: [Virtual Try-On / Product-Only]               │   │
│  │  Template/Model/Pose: [Select one for all]           │   │
│  │  Images per product: [1] [4] [8]                     │   │
│  │  Aspect Ratio: 1:1 / 4:5 / 16:9                      │   │
│  │                                                      │   │
│  │  Estimated: 3 products × 4 images = 12 credits       │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           ▼                                  │
│  3. QUEUE PROCESSING (Sequential)                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Product C: ████████████████░░░░ 80% (3/4 images)    │   │
│  │  Product D: ░░░░░░░░░░░░░░░░░░░░ Waiting...          │   │
│  │  Product F: ░░░░░░░░░░░░░░░░░░░░ Waiting...          │   │
│  │                                                      │   │
│  │  Overall: 1/3 products completed                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           ▼                                  │
│  4. BULK RESULTS                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  [Product C: 4 images] [Product D: 4 images]         │   │
│  │  [Product F: 4 images]                               │   │
│  │                                                      │   │
│  │  [Publish All] [Publish Selected] [Download All]     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Edge Cases ir Sprendimai

| Edge Case | Rizika | Sprendimas |
|-----------|--------|------------|
| **50+ produktų** | API rate limit, timeout | Max 20 produktų per batch, arba "Schedule for later" |
| **Vienas produktas fails** | Visa generacija sustoja | Continue on error - praleidžiame failed ir tęsiame |
| **Vartotojas uždaro langą** | Prarandami rezultatai | LocalStorage checkpoint + resume funkcija |
| **Nepakankami credits** | Nepilna generacija | Pre-check credits prieš pradedant |
| **Didelės nuotraukos** | Slow base64 conversion | Parallel conversion su progress indicator |
| **API timeout** | Produktas lieka "generating" | Retry su exponential backoff (max 3 attempts) |
| **Skirtingi produktų tipai** | Ne visiems tinka Virtual Try-On | Filter/warning jei pasirinkti ne-clothing produktai |

## Implementacijos Etapai

### Etapas 1: Multi-Select UI produktų puslapyje
- Checkbox prie kiekvieno produkto
- "Select All" / "Clear Selection" mygtukai
- Floating action bar: "Generate for X products"
- Mobile: swipe to select arba long-press

### Etapas 2: Bulk Settings Modal
- Pasirinkti generavimo mode (Product-Only / Virtual Try-On)
- Pasirinkti template ARBA model+pose visiems
- Image count ir aspect ratio
- Credit calculator su warning jei per daug

### Etapas 3: Queue System (Frontend)
- `useBulkGeneration` hook su queue logic
- Sequential processing su configurable concurrency (default: 1)
- Progress tracking per-product ir overall
- Pause/Resume/Cancel capabilities

### Etapas 4: Bulk Results View
- Grid view su visais sugeneruotais produktais
- Bulk publish: publish all arba select individual
- Download all as ZIP (optional future feature)
- Save as "Generation Batch" Jobs istorijoje

## Techniniai Pakeitimai

### Nauji Failai

| Failas | Paskirtis |
|--------|-----------|
| `src/types/bulk.ts` | Bulk generation tipai |
| `src/hooks/useBulkGeneration.ts` | Queue processing logic |
| `src/components/app/BulkSettingsModal.tsx` | Nustatymų modal |
| `src/components/app/BulkProgressTracker.tsx` | Progress UI |
| `src/components/app/BulkResultsView.tsx` | Results grid |
| `src/components/app/ProductMultiSelect.tsx` | Multi-select UI |

### Modifikuojami Failai

| Failas | Pakeitimai |
|--------|------------|
| `src/pages/Generate.tsx` | Pridėti bulk mode entry point |
| `src/types/index.ts` | Bulk related types |
| `src/data/mockData.ts` | Mock bulk jobs |

## Tipų Apibrėžimai

```typescript
// src/types/bulk.ts

export interface BulkGenerationConfig {
  mode: 'product-only' | 'virtual-try-on';
  // Product-only settings
  templateId?: string;
  // Virtual Try-On settings
  modelId?: string;
  poseId?: string;
  // Common settings
  imageCount: 1 | 4 | 8;
  aspectRatio: AspectRatio;
  quality: ImageQuality;
}

export interface BulkQueueItem {
  productId: string;
  product: Product;
  sourceImageUrl: string;
  status: 'pending' | 'converting' | 'generating' | 'completed' | 'failed';
  progress: number;
  results?: string[];
  error?: string;
  retryCount: number;
}

export interface BulkGenerationState {
  batchId: string;
  config: BulkGenerationConfig;
  queue: BulkQueueItem[];
  currentIndex: number;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'cancelled';
  startedAt?: string;
  completedAt?: string;
  totalCreditsUsed: number;
}

export interface BulkGenerationResult {
  batchId: string;
  productResults: {
    productId: string;
    productTitle: string;
    images: string[];
    status: 'success' | 'partial' | 'failed';
  }[];
  summary: {
    totalProducts: number;
    successfulProducts: number;
    failedProducts: number;
    totalImages: number;
    creditsUsed: number;
  };
}
```

## useBulkGeneration Hook Logika

```typescript
// Pseudo-code for queue processing
async function processQueue() {
  for (const item of queue) {
    if (state.status === 'paused' || state.status === 'cancelled') {
      break;
    }
    
    try {
      // 1. Convert image to base64
      updateItemStatus(item.productId, 'converting');
      const base64Image = await convertImageToBase64(item.sourceImageUrl);
      
      // 2. Generate images
      updateItemStatus(item.productId, 'generating');
      const result = await generateWithRetry(item, base64Image);
      
      // 3. Store results
      updateItemResults(item.productId, result.images);
      updateItemStatus(item.productId, 'completed');
      
    } catch (error) {
      if (item.retryCount < MAX_RETRIES) {
        // Retry with exponential backoff
        await delay(1000 * Math.pow(2, item.retryCount));
        item.retryCount++;
        // Re-add to queue
      } else {
        updateItemStatus(item.productId, 'failed', error.message);
        // Continue with next product (don't stop entire batch)
      }
    }
    
    // Delay between products to avoid rate limits
    await delay(INTER_PRODUCT_DELAY); // 2 seconds
  }
}
```

## UI/UX Flow

### Step 1: Product Selection (Generate page)
1. Vartotojas mato produktų sąrašą su checkbox
2. Paspaudžia "Bulk Generate" floating button
3. Sistema patikrina ar visi produktai tinka pasirinktam mode

### Step 2: Bulk Settings Modal
1. Modal su mode pasirinkimu
2. Template/Model+Pose selector (kaip single generation)
3. Credit summary: "12 images × 3 credits = 36 credits"
4. "Not enough credits" warning jei reikia

### Step 3: Processing View
1. Progress bar kiekvienam produktui
2. Overall progress: "2/5 products completed"
3. Live preview: rodomi naujausi sugeneruoti images
4. Pause/Cancel mygtukai
5. "Continue in background" option (localStorage state)

### Step 4: Results
1. Grid su produktais ir jų images
2. Expandable sections per produktą
3. Bulk actions: Publish All, Download All
4. Individual image selection for selective publish

## Apsaugos nuo Sistemos Perkrovos

1. **Max Products per Batch**: 20 (configurable)
2. **Sequential Processing**: 1 produktas vienu metu
3. **Inter-Product Delay**: 2 sekundės tarp produktų
4. **Retry Limit**: Max 3 bandymai per produktą
5. **Exponential Backoff**: 1s, 2s, 4s delay tarp retry
6. **Credit Pre-check**: Tikrinama prieš pradedant
7. **Rate Limit Handling**: Automatic pause jei 429 error

## Credits Skaičiavimas

```typescript
function calculateBulkCredits(
  productCount: number, 
  imagesPerProduct: number, 
  mode: GenerationMode
): number {
  const creditsPerImage = mode === 'virtual-try-on' ? 3 : 1;
  return productCount * imagesPerProduct * creditsPerImage;
}

// Example: 5 products × 4 images × 3 credits (try-on) = 60 credits
```

## LocalStorage Checkpoint (Resume Feature)

```typescript
// Save checkpoint every time item completes
function saveCheckpoint(state: BulkGenerationState) {
  localStorage.setItem(
    `bulk_generation_${state.batchId}`,
    JSON.stringify({
      ...state,
      savedAt: new Date().toISOString(),
    })
  );
}

// On page load, check for incomplete batches
function checkForIncompleteBatches(): BulkGenerationState | null {
  const keys = Object.keys(localStorage)
    .filter(k => k.startsWith('bulk_generation_'));
  
  for (const key of keys) {
    const state = JSON.parse(localStorage.getItem(key)!);
    if (state.status === 'running' || state.status === 'paused') {
      return state; // Offer to resume
    }
  }
  return null;
}
```

## Tikėtinas Rezultatas

Po implementacijos vartotojas galės:
- Pasirinkti 2-20 produktų vienu metu
- Taikyti vieną template/model+pose visiems
- Matyti real-time progress kiekvienam produktui
- Pristabdyti ir tęsti generavimą
- Bulk publish visus rezultatus į Shopify
- Atsigauti nuo klaidų be visos generacijos praradimo
