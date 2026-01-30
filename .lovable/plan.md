

# Virtual Try-On Fix - Enable Lovable Cloud

## Problema

Klaida "Supabase URL not configured" rodo, kad projektas turi sukurtą edge function (`generate-tryon`), bet Lovable Cloud backend dar nėra įjungtas. Dėl to:
- `VITE_SUPABASE_URL` aplinkos kintamasis neegzistuoja
- Edge function negali būti iškviesta
- AI image generation neveikia

## Sprendimas

### 1. Įjungti Lovable Cloud

Pirmiausiai reikia įjungti Lovable Cloud - tai suteiks:
- Supabase backend su edge functions palaikymu
- Automatiškai sukonfigūruos `VITE_SUPABASE_URL` ir `VITE_SUPABASE_PUBLISHABLE_KEY`
- Edge function `generate-tryon` bus automatiškai deploy'inta

### 2. Patikrinti Edge Function

Po Lovable Cloud įjungimo:
- Edge function bus pasiekiama adresu `{SUPABASE_URL}/functions/v1/generate-tryon`
- `LOVABLE_API_KEY` jau yra sukonfigūruotas (matau secrets sąraše)
- AI generation turėtų veikti

## Veiksmai

| Žingsnis | Veiksmas |
|----------|----------|
| 1 | Įjungti Lovable Cloud projektui |
| 2 | Edge function automatiškai deploy'inama |
| 3 | Išbandyti Virtual Try-On generavimą |

## Techniniai detaliai

Edge function jau sukurta teisingai:
- Naudoja `google/gemini-2.5-flash-image` modelį
- Turi optimizuotus prompts fashion fotografijai
- Palaiko error handling (429/402)
- Grąžina sugeneruotus images kaip base64

Frontend hook (`useGenerateTryOn.ts`) irgi teisingas - tiesiog trūksta `VITE_SUPABASE_URL` kintamojo, kuris atsiras įjungus Lovable Cloud.

