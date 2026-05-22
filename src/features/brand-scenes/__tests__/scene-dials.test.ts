import { describe, expect, it } from "vitest";
import { assembleSceneDirective } from "../prompt/assembleSceneDirective";
import { brandSceneCastSchema } from "../schema";

describe("versatility dials", () => {
  it("emits new dial directives in canonical order", () => {
    const out = assembleSceneDirective({
      source: "wizard",
      sub_family: "x",
      base: {
        aesthetic: "Indoor studio",
        setting: "Tabletop surface",
        surface: "polished_stone",
        subject_focus: "product",
        composition: "thirds",
        negative_space_intent: "headline",
        color_contrast: "bold",
        saturation: "vivid",
        shadows: "soft",
        aesthetic_era: "quiet_luxury",
        realism: "high_fashion",
        brand_voice: "premium_quiet",
        output_use_case: "web_hero",
        prop_density: 2,
      },
      module_answers: {},
    });
    expect(out).toMatch(/Setting: Tabletop surface on polished stone slab/);
    expect(out).toMatch(/Mood:.*premium quiet brand voice/);
    expect(out).toMatch(/Lighting:.*soft diffuse shadows/);
    expect(out).toMatch(/Framing:.*rule-of-thirds.*headline/);
    expect(out).toMatch(/Color:.*bold high contrast.*vivid/);
    expect(out).toMatch(/Subject focus: product is the hero focus/);
    expect(out).toMatch(/Prop density: Considered \(level 2\/4\)/);
    expect(out).toMatch(/Output: designed for website hero/);
  });

  it("emits hands-on-product and body-part focus in cast directive", () => {
    const out = assembleSceneDirective({
      source: "wizard",
      sub_family: "x",
      base: {},
      module_answers: {},
      cast: {
        preset: "hands",
        interaction: "holding",
        hands_on_product: "cradle",
        body_part_focus: "hands",
      },
    });
    expect(out).toMatch(/Hands: both hands cradling/);
    expect(out).toMatch(/Body-part focus: hands/);
  });

  it("schema rejects cast=none with non-hero interaction", () => {
    const r = brandSceneCastSchema.safeParse({
      preset: "none",
      interaction: "holding",
    });
    expect(r.success).toBe(false);
  });

  it("schema rejects hands cast with wearing interaction", () => {
    const r = brandSceneCastSchema.safeParse({
      preset: "hands",
      interaction: "wearing",
    });
    expect(r.success).toBe(false);
  });

  it("schema rejects hero interaction with people cast", () => {
    const r = brandSceneCastSchema.safeParse({
      preset: "solo",
      interaction: "hero",
    });
    expect(r.success).toBe(false);
  });

  it("schema accepts cast=none + hero", () => {
    const r = brandSceneCastSchema.safeParse({
      preset: "none",
      interaction: "hero",
    });
    expect(r.success).toBe(true);
  });
});
