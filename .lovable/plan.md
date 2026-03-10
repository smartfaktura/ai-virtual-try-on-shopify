

## Reorder `mockModels` Array to Match Landing Page Sequence

Reorder the `mockModels` array in `src/data/mockData.ts` (lines 1260-1311) to match the same sequence used in the landing page marquee. This will update both the Freestyle model selector and the Generate page model selector.

### New Order

**Priority models first (your requested sequence), then remaining models alternating W-M:**

1. Freya → Zara → Anders → Sienna → Jordan → Hannah → Kai → Valeria → Fatima → Akiko → Olivia → Marcus (African American) → Isabella → Luca/Liam → Charlotte → Tyler → Amara/Nia → Omar → Priya (Indian) → Brandon/Ethan → Natalie → Hiro/Jin

Then remaining: Elena/Sofia → Arjun/Ravi → Madison/Ingrid → Diego → Sophie/Charlotte(European) → Callum/Rowan → Nadia/Amara(athletic) → Max/Henrik → Aubrey/Soo-Min → Kenji → Zoe/Elena(Latina) → Marco/Mateo → Niamh/Daphne → Kwame/Jamal → Mei → Ryan/Leo → Aisha/Maya → Carlos/Chen Wei → Leila/Layla → Erik/Anders(dup removed) → Emma → Hana/Soo-Min → remaining models (Sofia Spanish, Sienna Italian, Clara, Elise, Priya athletic, etc.)

### File Changed
**`src/data/mockData.ts`** — Reorder the entries in the `mockModels` array (lines 1260–1311). No additions or deletions, just resequencing to put Freya first and follow the same priority + W-M alternating pattern.

