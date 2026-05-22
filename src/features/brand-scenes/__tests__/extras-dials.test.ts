import { describe, it, expect } from "vitest";
import { assembleSceneDirective } from "../prompt/assembleSceneDirective";
import { brandSceneBaseAnswersSchema, brandSceneCastSchema } from "../schema";
import type { BrandSceneAnswers } from "../types";

const base = (): BrandSceneAnswers => ({
  source: "wizard",
  module: "fashion",
  sub_family: "tops",
  base: {},
  module_answers: {},
});

describe("Phase 7d — flexible extras", () => {
  it("renders known scene extras with friendly prefixes", () => {
    const a = base();
    a.base.extras = {
      backdrop_type: "Brick wall",
      floor: "Polished concrete",
      camera_angle: "¾ left, eye level",
      light_quality: "Softbox diffuse",
      motion: "Hair in motion",
    };
    const out = assembleSceneDirective(a);
    expect(out).toContain("Backdrop: Brick wall.");
    expect(out).toContain("Floor: Polished concrete.");
    expect(out).toContain("Camera angle: ¾ left, eye level.");
    expect(out).toContain("Light quality: Softbox diffuse.");
    expect(out).toContain("Motion: Hair in motion.");
  });

  it("renders cast extras", () => {
    const a = base();
    a.cast = {
      preset: "solo",
      interaction: "wearing",
      extras: {
        hair: "Slicked back",
        makeup: "Glossy lip",
        pose_energy: "Confident stance",
      },
    };
    const out = assembleSceneDirective(a);
    expect(out).toContain("Hair: Slicked back.");
    expect(out).toContain("Makeup: Glossy lip.");
    expect(out).toContain("Pose: Confident stance.");
  });

  it("supports custom (user-typed) values verbatim", () => {
    const a = base();
    a.base.extras = { backdrop_color: "#c47b62 dusty rose" };
    const out = assembleSceneDirective(a);
    expect(out).toContain("Backdrop color: #c47b62 dusty rose.");
  });

  it("renders unknown extras as Style () lines", () => {
    const a = base();
    a.base.extras = { future_dial: "experimental directive" };
    const out = assembleSceneDirective(a);
    expect(out).toContain("Style (future_dial): experimental directive.");
  });

  it("schema accepts extras maps within limits", () => {
    const parsed = brandSceneBaseAnswersSchema.parse({
      extras: { backdrop_type: "Brick wall", floor: "Sand" },
    });
    expect(parsed.extras?.backdrop_type).toBe("Brick wall");

    const cast = brandSceneCastSchema.parse({
      preset: "solo",
      interaction: "wearing",
      extras: { hair: "Tousled" },
    });
    expect(cast.extras?.hair).toBe("Tousled");
  });

  it("schema rejects > 40 extras keys", () => {
    const big: Record<string, string> = {};
    for (let i = 0; i < 41; i++) big[`k${i}`] = "v";
    expect(() =>
      brandSceneBaseAnswersSchema.parse({ extras: big }),
    ).toThrow();
  });
});
