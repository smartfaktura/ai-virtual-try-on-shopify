
# Bulk Generation Settings - Inline Step (be popup)

## Problema
Dabartinis modal popup:
- Perdengia puslapį ir sukelia "context switch"
- Sunku naviguoti tarp žingsnių
- Nepatogu mobiliuose
- Nenuoseklu su kitais app flow

## Sprendimas
Pakeisti modal į **inline step** tame pačiame puslapyje:
- Step 1: Produktų pasirinkimas → Step 2: Nustatymai (inline) → Step 3: Processing → Step 4: Results

## UI Flow po pakeitimo

```text
┌─────────────────────────────────────────────────────────────┐
│  BULK GENERATION                                             │
│  ← Back to Generate                                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ● Step 1: Select Products  ──── ○ Step 2: Settings         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  [Settings Card - INLINE]                              │ │
│  │                                                        │ │
│  │  Summary: 2 products selected                          │ │
│  │                                                        │ │
│  │  Generation Mode                                       │ │
│  │  ○ Product Photography    ● Virtual Try-On             │ │
│  │                                                        │ │
│  │  Select Model                                          │ │
│  │  [Grid of models...]                                   │ │
│  │                                                        │ │
│  │  Select Pose                                           │ │
│  │  [Grid of poses...]                                    │ │
│  │                                                        │ │
│  │  Options: 4 images | 1:1 | Standard                    │ │
│  │                                                        │ │
│  │  Cost: 24 credits    Balance: 500 credits              │ │
│  │                                                        │ │
│  │  [← Back]                      [Generate 8 Images →]   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Techniniai pakeitimai

| Failas | Pakeitimas |
|--------|------------|
| `src/components/app/BulkSettingsModal.tsx` | Pervadinti į `BulkSettingsCard.tsx`, pašalinti Modal wrapper, palikti turinį kaip Card |
| `src/pages/BulkGenerate.tsx` | Pakeisti step flow - vietoj modal atidarymo rodyti settings Card inline |

## Detali implementacija

### 1. Sukurti `BulkSettingsCard.tsx`
- Paimti visą turinį iš `BulkSettingsModal.tsx`
- Pašalinti `<Modal>` wrapper
- Apgaubti į `<Card>` su proper spacing
- Pridėti "Back" mygtuką grįžti į produktų pasirinkimą
- Pridėti step indicator viršuje

### 2. Atnaujinti `BulkGenerate.tsx`
- Pašalinti `settingsModalOpen` state
- Pridėti `currentStep === 'settings'` atvejį
- Rodyti `BulkSettingsCard` inline vietoj modal
- Atnaujinti step navigaciją

### 3. Step indicator
- Vizualus progress: `Select Products → Configure Settings → Processing → Results`
- Galimybė grįžti atgal per žingsnius

## Privalumai

1. **Nuoseklus flow** - vartotojas mato visą procesą vienoje vietoje
2. **Lengvesnė navigacija** - Back/Next mygtukai vietoj modal close
3. **Geresnis mobile UX** - nėra overlay, viskas scrollable
4. **Shopify Admin pattern** - atitinka Polaris wizard guidelines
