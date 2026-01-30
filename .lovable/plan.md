
# Problema: AI neatsižvelgia į pasirinkto modelio išvaizdą

## Diagnozė

Patikrinau visą generavimo flow ir radau pagrindinę problemą:

### Kas dabar vyksta:
1. Frontend siunčia modelio **tekstinius duomenis**: `gender`, `ethnicity`, `bodyType`, `ageRange`
2. Edge function sudaro prompt'ą: *"Professional fashion photography of a female model (Nordic, slim build, early 20s)..."*
3. AI gauna **tik produkto nuotrauką** kaip vizualinę reference
4. AI sukuria modelį pagal **tekstinį aprašymą** - bet tai labai netikslua

### Problema:
**Modelio nuotrauka (`previewUrl`) niekur nesiunčiama į AI!**

AI modelis nežino kaip tiksliai atrodo Ingrid - jis tik žino kad tai "Nordic, slim, young-adult female". Todėl AI sugeneruoja atsitiktinę moterį atitinkančią šiuos parametrus.

## Sprendimas

Reikia siųsti **dvi nuotraukas** į AI:
1. **Produkto nuotrauką** - rūbas kurį modelis turi dėvėti
2. **Modelio nuotrauką** - kaip turėtų atrodyti modelis

### Prompt'o struktūra po pakeitimo:
```text
"Generate a photo where the model from [Image 2] wears the clothing from [Image 1].
Keep the model's exact face, skin tone, and body type.
..."
```

## Techniniai pakeitimai

### 1. Atnaujinti `useGenerateTryOn.ts`
- Konvertuoti ir modelio nuotrauką į base64
- Siųsti `modelImageUrl` į edge function

### 2. Atnaujinti Edge Function `generate-tryon/index.ts`
- Pridėti `modelImageUrl` į request interface
- Siųsti **dvi nuotraukas** į Gemini API
- Atnaujinti prompt'ą kad nurodytų AI naudoti abi nuotraukas

### 3. Modifikuoti API request struktūrą
Dabartinis:
```typescript
content: [
  { type: "text", text: prompt },
  { type: "image_url", image_url: { url: productImage } }
]
```

Po pakeitimo:
```typescript
content: [
  { type: "text", text: prompt },
  { type: "image_url", image_url: { url: productImage } },  // Rūbas
  { type: "image_url", image_url: { url: modelImage } }     // Modelis
]
```

## Failų pakeitimai

| Failas | Veiksmas |
|--------|----------|
| `src/hooks/useGenerateTryOn.ts` | Pridėti modelio nuotraukos konvertavimą ir siuntimą |
| `supabase/functions/generate-tryon/index.ts` | Pridėti modelio nuotrauką į API request |

## Tikėtinas rezultatas

Po šių pakeitimų:
- Pasirinkus **Ingrid** - sugeneruota nuotrauka rodys moterį su **Ingrid veido bruožais ir odos spalva**
- Pasirinkus **Amara** (Black African) - sugeneruota nuotrauka rodys atitinkamą modelį
- Modelių įvairovė bus tikra ir atitiks pasirinkimą

## Svarbu!

Gemini Flash Image palaiko kelias nuotraukas viename request'e. Prompt'e reikės aiškiai nurodyti:
- Pirma nuotrauka = rūbas (reference for clothing)
- Antra nuotrauka = modelis (reference for person's appearance)
