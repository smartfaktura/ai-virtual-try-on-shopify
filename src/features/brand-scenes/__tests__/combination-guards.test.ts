import { describe, expect, it } from "vitest";
import {
  forbiddenInteractions,
  forbiddenCastPresets,
  warnings,
} from "../wizard/rules/combinationGuards";

describe("combination guards", () => {
  it("forbids holding/wearing/using/beside when cast is none", () => {
    const f = forbiddenInteractions("none", undefined, undefined);
    expect(f.has("holding")).toBe(true);
    expect(f.has("wearing")).toBe(true);
    expect(f.has("using")).toBe(true);
    expect(f.has("beside")).toBe(true);
    expect(f.has("hero")).toBe(false);
  });

  it("forbids wearing for hands-only cast", () => {
    expect(forbiddenInteractions("hands", undefined, undefined).has("wearing")).toBe(true);
  });

  it("forbids hero when people are present", () => {
    expect(forbiddenInteractions("solo", undefined, undefined).has("hero")).toBe(true);
  });

  it("forbids wearing for fragrance family", () => {
    expect(forbiddenInteractions("solo", "beauty-fragrance", "pocket").has("wearing")).toBe(true);
  });

  it("forbids holding and wearing at architectural scale", () => {
    const f = forbiddenInteractions("solo", "home", "architectural");
    expect(f.has("holding")).toBe(true);
    expect(f.has("wearing")).toBe(true);
  });

  it("forbids hands cast at architectural scale", () => {
    expect(forbiddenCastPresets("architectural", "home").has("hands")).toBe(true);
  });

  it("forbids group cast for small jewelry/eyewear pocket scale", () => {
    expect(forbiddenCastPresets("pocket", "jewelry").has("group")).toBe(true);
    expect(forbiddenCastPresets("pocket", "eyewear").has("group")).toBe(true);
  });

  it("emits a macro+people warning", () => {
    const out = warnings({
      source: "wizard",
      sub_family: "x",
      base: { lens: "macro" },
      module_answers: {},
      cast: { preset: "solo", interaction: "wearing" },
    });
    expect(out.some((w) => w.field === "lens")).toBe(true);
  });
});
