import { describe, expect, it } from "vitest";
import { resolveAll, resolveBundle } from "../wizard/registry/resolvePresets";

describe("category presets", () => {
  it("jewelry rings restrict scale to pocket and prefer hands cast", () => {
    const r = resolveAll("jewelry", "jewellery-rings");
    expect(r.scale.values).toEqual(["pocket"]);
    expect(r.defaultCast).toBe("hands");
    expect(r.castPresets).toContain("hands");
    expect(r.castPresets).not.toContain("group");
  });

  it("home furniture defaults to no-people and excludes wearing", () => {
    const r = resolveAll("home", "furniture");
    expect(r.defaultCast).toBe("none");
    expect(r.interactions).not.toContain("wearing");
  });

  it("fragrance excludes wearing interaction", () => {
    const r = resolveAll("beauty-fragrance", "fragrance");
    expect(r.interactions).not.toContain("wearing");
    expect(r.defaultCast).toBe("none");
  });

  it("sub-family overrides cascade over family base", () => {
    const fam = resolveBundle("bags-accessories", undefined);
    const sub = resolveBundle("bags-accessories", "wallets-cardholders");
    expect(fam.default_scale).toBe("carry");
    expect(sub.default_scale).toBe("pocket");
  });

  it("falls back to defaults for unknown family", () => {
    const r = resolveAll(undefined, undefined);
    expect(r.scale.values.length).toBeGreaterThan(0);
    expect(r.castPresets.length).toBeGreaterThan(0);
  });
});
