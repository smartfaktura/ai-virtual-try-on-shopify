import { describe, expect, it } from "vitest";
import { assembleSceneDirective } from "../prompt/assembleSceneDirective";
import type { BrandSceneAnswers } from "../types";

const base: BrandSceneAnswers = {
  source: "wizard",
  module: "fashion",
  sub_family: "tops",
  base: {},
  module_answers: {},
};

describe("scene extras in assembled directive", () => {
  it("emits setting, weather, season, lens, dof, palette, finish when set", () => {
    const out = assembleSceneDirective({
      ...base,
      base: {
        setting: "Urban street",
        weather: "rain",
        season: "autumn",
        lens: "portrait",
        depth_of_field: "shallow",
        palette_preset: "terracotta",
        finish: "film_grain",
      },
    });
    expect(out).toMatch(/Setting: Urban street/);
    expect(out).toMatch(/Weather: rain/);
    expect(out).toMatch(/Season: autumn/);
    expect(out).toMatch(/Camera: 50mm portrait/);
    expect(out).toMatch(/Depth of field: shallow/);
    expect(out).toMatch(/Color palette: earthy/i);
    expect(out).toMatch(/Finish: subtle film grain/);
  });

  it("custom palette overrides preset", () => {
    const out = assembleSceneDirective({
      ...base,
      base: {
        palette_preset: "monochrome",
        palette_custom: "dusty rose and cocoa",
      },
    });
    expect(out).toMatch(/dusty rose and cocoa/);
    expect(out).not.toMatch(/monochrome/);
  });

  it("season-less is suppressed", () => {
    const out = assembleSceneDirective({
      ...base,
      base: { season: "seasonless" },
    });
    expect(out).not.toMatch(/Season:/);
  });

  it("avoid pulls from base.avoid first, falls back to negative_note", () => {
    expect(
      assembleSceneDirective({
        ...base,
        base: { avoid: "no logos" },
        negative_note: "no people",
      }),
    ).toMatch(/Avoid: no logos/);

    expect(
      assembleSceneDirective({ ...base, negative_note: "no people" }),
    ).toMatch(/Avoid: no people/);
  });

  it("stays stable when nothing extra is set", () => {
    const out = assembleSceneDirective(base);
    expect(out).toMatch(/Aspect ratio: 4:5/);
    expect(out).not.toMatch(/Setting:/);
    expect(out).not.toMatch(/Camera:/);
  });

  it("cast wardrobe color renders", () => {
    const out = assembleSceneDirective({
      ...base,
      cast: {
        preset: "solo",
        interaction: "wearing",
        wardrobe_color: "earth_tones",
      },
    });
    expect(out).toMatch(/Wardrobe: earth-tone/);
  });

  it("cast-vs-product sentence appears when people + scale", () => {
    const out = assembleSceneDirective({
      ...base,
      cast: { preset: "solo", interaction: "holding" },
      scale: { preset: "handheld" },
    });
    expect(out).toMatch(/Cast-vs-product: product is held/);
  });

  it("no cast-vs-product when preset is 'none'", () => {
    const out = assembleSceneDirective({
      ...base,
      cast: { preset: "none", interaction: "hero" },
      scale: { preset: "handheld" },
    });
    expect(out).not.toMatch(/Cast-vs-product/);
  });
});
