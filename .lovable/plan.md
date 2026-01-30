
# Problemos Diagnozė ir Sprendimas: Neteisingas AI Generavimo Rezultatas

## Problema
Pasirinkote **Airlift High-Waist Legging**, bet sugeneruota **hoodie** nuotrauka. Tai rimtas bug.

## Priežasties Analizė

Problema yra tame, kad produktų nuotraukos yra **local assets** (importuoti iš `src/assets/products/`), kurie po Vite kompiliavimo tampa relative paths kaip `/assets/leggings-black-1.jpg`. 

Kai edge function siunčia šį URL į AI modelį (Gemini), **AI negali pasiekti šio URL** nes:
- Tai nėra pilnas HTTPS URL
- AI serveris negali prisijungti prie jūsų vietinio preview serverio

Todėl AI modelis tiesiog sugeneruoja atsitiktinę nuotrauką pagal tekstinį prompt'ą, ignoruodamas produkto nuotrauką.

## Sprendimas

Reikia padaryti, kad produktų nuotraukos būtų pasiekiamos per pilną HTTPS URL. Yra du būdai:

### Variantas A: Konvertuoti local images į Base64 (Rekomenduojama)
Frontend'e konvertuoti nuotrauką į base64 prieš siunčiant į edge function:

```typescript
// Prieš siunčiant į generate-tryon
async function imageToBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}
```

Tada siųsti base64 data URL vietoj relative path.

### Variantas B: Uploadinti į Storage prieš generavimą
Prieš generavimą, uploadinti produkto nuotrauką į Supabase Storage ir gauti public URL.

---

## Implementacijos Planas

### 1. Sukurti utility funkciją Base64 konvertavimui
- Failas: `src/lib/imageUtils.ts`
- Funkcija: `convertImageToBase64(url: string): Promise<string>`

### 2. Atnaujinti `useGenerateTryOn` hook
- Prieš siunčiant request, konvertuoti `sourceImageUrl` į base64
- Siųsti base64 data URL vietoj relative path

### 3. Patikrinti Edge Function
- Gemini API palaiko base64 images formatu `data:image/jpeg;base64,...`
- Jokių pakeitimų edge function nereikia

### 4. Pridėti logging
- Pridėti console.log, kad būtų galima matyti kas siunčiama į API debugging tikslais

---

## Pakeitimai failuose

| Failas | Veiksmas |
|--------|----------|
| `src/lib/imageUtils.ts` | SUKURTI - Base64 konvertavimo utility |
| `src/hooks/useGenerateTryOn.ts` | MODIFIKUOTI - Konvertuoti image prieš siuntimą |
| `src/pages/Generate.tsx` | MODIFIKUOTI - Pridėti loading state konvertavimui |

---

## Kodas

### `src/lib/imageUtils.ts` (Naujas failas)
```typescript
export async function convertImageToBase64(imageUrl: string): Promise<string> {
  // Jei jau base64 arba data URL - grąžinti kaip yra
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // Jei tai pilnas HTTPS URL (ne local) - grąžinti kaip yra
  if (imageUrl.startsWith('https://') && !imageUrl.includes('localhost')) {
    return imageUrl;
  }
  
  // Konvertuoti local/relative URL į base64
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
```

### `useGenerateTryOn.ts` pakeitimai
Hook'e, prieš siunčiant request, konvertuoti image:

```typescript
import { convertImageToBase64 } from '@/lib/imageUtils';

// generate funkcijoje:
const base64Image = await convertImageToBase64(params.sourceImageUrl);

// Siųsti base64Image vietoj params.sourceImageUrl
body: JSON.stringify({
  product: {
    ...
    imageUrl: base64Image,  // Base64 vietoj relative path
  },
  ...
})
```

---

## Rezultatas
Po šių pakeitimų:
- AI modelis gaus tikrą produkto nuotrauką kaip base64 data
- Generuotas rezultatas atitiks pasirinktą produktą (leggings → leggings, ne hoodie)
- Tiek local assets, tiek uploaded images, tiek external URLs veiks korektiškai
