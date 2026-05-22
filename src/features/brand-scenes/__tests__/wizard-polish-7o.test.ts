import { describe, expect, it } from "vitest";
import { resolveAll } from "../wizard/registry/resolvePresets";
import {
  SCENE_EXTRAS_FIELDS,
  CAST_EXTRAS_FIELDS,
  applicableFields,
} from "../wizard/constants/extras";
import { getStorytellingMoments } from "../wizard/registry/storytellingBySubfamily";
import { assembleSceneDirective } from "../prompt/assembleSceneDirective";
import type { BrandSceneAnswers } from "../types";

describe("Phase 7o — hats-caps-beanies subfamily overrides", () => {
  it("caps and beanies have distinct settings + moods", () => {
    const caps = resolveAll("hats-caps-beanies", "caps");
    const beanies = resolveAll("hats-caps-beanies", "beanies");
    expect(caps.settings).not.toEqual(beanies.settings);
    expect(caps.settings).toContain("Urban street");
    expect(beanies.settings).toContain("Nature");
  });

  it("hats falls back to its own indoor/editorial settings", () => {
    const hats = resolveAll("hats-caps-beanies", "hats");
    expect(hats.settings).toContain("Architectural interior");
    expect(hats.lens).toContain("portrait");
  });
});

describe("Phase 7o — footwear/shoes override", () => {
  it("dress shoes exclude Nature and lean indoor", () => {
    const shoes = resolveAll("footwear", "shoes");
    expect(shoes.settings).not.toContain("Nature");
    expect(shoes.settings).toContain("Architectural interior");
  });

  it("sneakers still get Urban street", () => {
    const sneakers = resolveAll("footwear", "sneakers");
    expect(sneakers.settings).toContain("Urban street");
  });
});

describe("Phase 7o — fashion/streetwear override", () => {
  it("streetwear bundles bold moods", () => {
    const streetwear = resolveAll("fashion", "streetwear");
    expect(streetwear.interactions).toEqual(["wearing", "hero"]);
  });
});

describe("Phase 7o — subfamily-gated extras visibility", () => {
  it("strap_material is visible for watches/watches, not eyewear/eyewear", () => {
    const watchFields = applicableFields(
      SCENE_EXTRAS_FIELDS,
      "watches",
      "hands",
      "watches",
    );
    expect(watchFields.map((f) => f.key)).toContain("strap_material");

    const eyewearFields = applicableFields(
      SCENE_EXTRAS_FIELDS,
      "eyewear",
      "solo",
      "eyewear",
    );
    expect(eyewearFields.map((f) => f.key)).not.toContain("strap_material");
    expect(eyewearFields.map((f) => f.key)).toContain("lens_tint");
    expect(eyewearFields.map((f) => f.key)).toContain("frame_material");
  });

  it("metal_tone + stone_presence visible for all 4 jewelry subs", () => {
    for (const sub of [
      "jewellery-rings",
      "jewellery-necklaces",
      "jewellery-earrings",
      "jewellery-bracelets",
    ]) {
      const fields = applicableFields(
        SCENE_EXTRAS_FIELDS,
        "jewelry",
        "hands",
        sub,
      );
      const keys = fields.map((f) => f.key);
      expect(keys).toContain("metal_tone");
      expect(keys).toContain("stone_presence");
    }
  });

  it("lacing_state visible for sneakers/boots only", () => {
    const sneakers = applicableFields(
      SCENE_EXTRAS_FIELDS,
      "footwear",
      "solo",
      "sneakers",
    );
    expect(sneakers.map((f) => f.key)).toContain("lacing_state");

    const heels = applicableFields(
      SCENE_EXTRAS_FIELDS,
      "footwear",
      "solo",
      "high-heels",
    );
    expect(heels.map((f) => f.key)).not.toContain("lacing_state");
  });

  it("sweat_finish visible only for fashion/activewear with people cast", () => {
    const active = applicableFields(
      CAST_EXTRAS_FIELDS,
      "fashion",
      "solo",
      "activewear",
    );
    expect(active.map((f) => f.key)).toContain("sweat_finish");

    const dresses = applicableFields(
      CAST_EXTRAS_FIELDS,
      "fashion",
      "solo",
      "dresses",
    );
    expect(dresses.map((f) => f.key)).not.toContain("sweat_finish");
  });
});

describe("Phase 7o — assembleSceneDirective emits subfamily product attributes", () => {
  const base: BrandSceneAnswers = {
    source: "wizard",
    module: "watches",
    sub_family: "watches",
    base: { extras: { strap_material: "Leather", dial_time: "10:10 convention" } },
    module_answers: {},
  };

  it("renders strap material and dial time as Style lines", () => {
    const out = assembleSceneDirective(base);
    expect(out).toContain("Strap material: Leather.");
    expect(out).toContain("Dial time: 10:10 convention.");
  });
});

describe("Phase 7o — storytelling top-up", () => {
  it("earrings, bracelets, belts all return ≥ 5 moments", () => {
    expect(getStorytellingMoments("jewelry", "jewellery-earrings").length)
      .toBeGreaterThanOrEqual(5);
    expect(getStorytellingMoments("jewelry", "jewellery-bracelets").length)
      .toBeGreaterThanOrEqual(5);
    expect(getStorytellingMoments("bags-accessories", "belts").length)
      .toBeGreaterThanOrEqual(5);
  });
});
