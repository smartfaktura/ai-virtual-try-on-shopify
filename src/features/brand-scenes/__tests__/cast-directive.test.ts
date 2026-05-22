import { describe, expect, it } from "vitest";
import { buildCastDirective } from "../prompt/buildCastDirective";

describe("buildCastDirective", () => {
  it("emits a replicate-only line for replicate preset", () => {
    expect(buildCastDirective({ preset: "replicate" })).toMatch(
      /do not alter subjects/i,
    );
  });

  it("emits a hero line for no-people preset", () => {
    const out = buildCastDirective({ preset: "none", interaction: "hero" });
    expect(out).toMatch(/no people in frame/i);
  });

  it("includes interaction and energy for solo + wearing + walking", () => {
    const out = buildCastDirective({
      preset: "solo",
      gender: ["woman"],
      age: ["adult"],
      vibe: "athlete",
      interaction: "wearing",
      action: "walking",
    });
    expect(out).toMatch(/one person/i);
    expect(out).toMatch(/athlete vibe/i);
    expect(out).toMatch(/wearing the product/i);
    expect(out).toMatch(/walking through frame/i);
  });

  it("handles hands-only without person descriptors", () => {
    const out = buildCastDirective({
      preset: "hands",
      interaction: "holding",
    });
    expect(out).toMatch(/hands only/i);
    expect(out).toMatch(/holding the product/i);
  });

  it("includes free-form note when given", () => {
    const out = buildCastDirective({
      preset: "two",
      interaction: "holding",
      note: "lead player smiles",
    });
    expect(out).toMatch(/lead player smiles/);
  });
});
