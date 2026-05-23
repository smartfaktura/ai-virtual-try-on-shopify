/**
 * Per-(module / sub-family) one-line vibe descriptions for setting presets.
 *
 * Used by `SettingPicker` to render a name + vibe card instead of a plain chip
 * for sub-families that benefit from extra context (e.g. lingerie interiors).
 */

const MAP: Record<string, Record<string, string>> = {
  "fashion/lingerie": {
    // indoor_lifestyle
    "Bedroom morning": "Soft daylight, rumpled linen sheets, intimate calm",
    "Velvet boudoir": "Deep tones, draped velvet, candle-warm boudoir",
    "Sunlit linen room": "High-key cream linens, gauzy curtains, airy",
    "Marble bath edge": "Pale marble, soft tile reflection, spa-cool",
    "Hotel suite drape": "Heavy curtains, neutral suite palette, editorial",
    "Dressing-room mirror": "Vanity bulbs, mirror reflection, backstage poise",
    "Loft bedroom by window": "Wide window light, modern loft, undone bed",
    "Silk-curtain bay": "Translucent silk drapes, diffused glow, romantic",
    "Quiet hallway with sheers": "Long corridor, sheer light, cinematic stillness",
    "Powder room corner": "Pastel walls, vintage vanity, soft-pink wash",
    "Walk-in closet bench": "Wood cabinetry, garment racks, intimate dressing",
    "Reading nook chaise": "Velvet chaise, books, warm reading-lamp pools",
    // studio
    "Soft silk drape": "Floating silk backdrop, hushed and sculptural",
    "Painted plaster wall": "Hand-troweled plaster, low-contrast warmth",
    "Cyclorama soft sweep": "Seamless sweep, beauty-clean light",
    "Pleated paper backdrop": "Sculpted paper folds, controlled shadow play",
    "Floating tulle veil": "Sheer tulle layers, ethereal diffusion",
    "Hard-light split studio": "Single hard source, sharp shadow, editorial",
    // architectural
    "Marble bathhouse": "Stone arches, steam, classical bathhouse",
    "Stone cloister": "Quiet cloister columns, raked daylight",
    "Brutalist concrete bedroom": "Raw concrete, monastic bed, low light",
    "Glass atrium banquette": "Glass-roof atrium, daylight pool, modern bench",
  },
};

export function getSettingDescriptions(
  module: string | undefined,
  subFamily: string | undefined,
): Record<string, string> | undefined {
  if (!module || !subFamily) return undefined;
  return MAP[`${module}/${subFamily}`];
}
