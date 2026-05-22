import { describe, expect, it } from "vitest";
import { assembleSceneDirective } from "../prompt/assembleSceneDirective";
import type { BrandSceneAnswers } from "../types";

const baseAnswers: BrandSceneAnswers = {
  source: "wizard",
  module: "fashion",
  sub_family: "tops",
  base: {},
  module_answers: {},
};

describe("assembleSceneDirective — aspect ratio lock", () => {
  it("always emits 4:5 even when base is empty", () => {
    const out = assembleSceneDirective(baseAnswers);
    expect(out).toMatch(/Aspect ratio: 4:5 \(portrait, vertical\) — REQUIRED/);
  });

  it("ignores any user-supplied aspect_ratio override", () => {
    const out = assembleSceneDirective({
      ...baseAnswers,
      base: { aspect_ratio: "16:9" },
    });
    expect(out).toMatch(/4:5 \(portrait, vertical\) — REQUIRED/);
    expect(out).not.toMatch(/16:9/);
  });
});
