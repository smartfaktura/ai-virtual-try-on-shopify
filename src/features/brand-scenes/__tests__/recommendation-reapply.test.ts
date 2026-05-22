import { describe, it, expect } from "vitest";
import { applyCascade, applySettingCascade, softWarnings } from "../wizard/rules/sceneRules";

describe("Phase 7g — recommendations persist after clear", () => {
  it("setting cascade seeds + clearing keeps recommendation chip", () => {
    const ctx = {
      module: "fashion" as const,
      sub_family: "swimwear",
      scene_type: "outdoor_nature" as const,
      setting: undefined,
      cast: "solo" as const,
      values: {},
      auto: {},
      recommendations: {},
    };
    const a = applySettingCascade("Ocean shoreline", ctx);
    expect(a.values.time_of_day_detail).toBe("Golden hour evening");
    expect(a.auto.time_of_day_detail).toBe(true);
    expect(a.recommendations.time_of_day_detail).toBe("Golden hour evening");

    // User clears the auto-filled value.
    const b = applyCascade("time_of_day_detail", undefined, {
      ...ctx,
      values: a.values,
      auto: a.auto,
      recommendations: a.recommendations,
    });
    expect(b.values.time_of_day_detail).toBeUndefined();
    // Recommendation is preserved so the UI can offer a re-apply chip.
    expect(b.recommendations.time_of_day_detail).toBe("Golden hour evening");
  });

  it("two-tone backdrop seeds two recommended colors", () => {
    const ctx = {
      values: {},
      auto: {},
      recommendations: {},
    };
    const r = applyCascade("backdrop_type", "Two-tone hard split", ctx);
    expect(r.values.backdrop_color_a).toBeTruthy();
    expect(r.values.backdrop_color_b).toBeTruthy();
    expect(r.recommendations.backdrop_color_a).toBeTruthy();
  });
});

describe("Phase 7g — softWarnings never throws and never blocks", () => {
  it("returns informational notes for unusual combos", () => {
    const ws = softWarnings({
      sub_family: "jackets",
      setting: "Tropical beach",
      values: {},
      auto: {},
    });
    expect(ws.length).toBeGreaterThan(0);
  });
  it("empty ctx returns []", () => {
    expect(softWarnings({ values: {}, auto: {} })).toEqual([]);
  });
});
