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

import { getSettingPool } from "../wizard/registry/settingsBySubfamily";

describe("Phase 7o → 7p — hats-caps-beanies subfamily pools", () => {
  it("caps and beanies have distinct outdoor pools", () => {
    const caps = getSettingPool("hats-caps-beanies", "caps", "outdoor_location");
    const beanies = getSettingPool("hats-caps-beanies", "beanies", "outdoor_nature");
    expect(caps).not.toEqual(beanies);
    expect(caps).toContain("Skate plaza");
    expect(beanies).toContain("Snowy alley");
  });

  it("hats indoor pool leans editorial", () => {
    const hats = getSettingPool("hats-caps-beanies", "hats", "indoor_lifestyle");
    expect(hats).toContain("Atelier");
  });
});

describe("Phase 7o → 7p — footwear/shoes pool", () => {
  it("dress shoes have an indoor_lifestyle pool but no outdoor_nature", () => {
    expect(getSettingPool("footwear", "shoes", "indoor_lifestyle")).toContain("Hotel lobby");
    // shoes pool has no outdoor_nature entry → falls back to GLOBAL nature list
    const fallback = getSettingPool("footwear", "shoes", "outdoor_nature");
    expect(fallback).toContain("Forest trail"); // GLOBAL fallback, not shoes-specific
  });

  it("sneakers outdoor_location pool is skate-flavored", () => {
    const sneakers = getSettingPool("footwear", "sneakers", "outdoor_location");
    expect(sneakers).toContain("Skate plaza");
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
