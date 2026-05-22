import { describe, it, expect } from "vitest";
import {
  getStorytellingMoments,
  hasExplicitMoments,
} from "../wizard/registry/storytellingBySubfamily";

describe("Phase 7j — per-subfamily storytelling moments", () => {
  it("returns hoodie-specific moments for fashion/hoodies", () => {
    const moments = getStorytellingMoments("fashion", "hoodies");
    expect(moments).toContain("Pulling hood up");
    expect(hasExplicitMoments("fashion", "hoodies")).toBe(true);
  });

  it("returns generic fallback when sub-family is unmapped", () => {
    const moments = getStorytellingMoments("fashion", "totally-unknown-slug");
    expect(moments.length).toBeGreaterThan(0);
    expect(hasExplicitMoments("fashion", "totally-unknown-slug")).toBe(false);
  });

  it("returns swim-specific moments for fashion/swimwear", () => {
    expect(getStorytellingMoments("fashion", "swimwear")).toContain(
      "Stepping out of water",
    );
  });
});
