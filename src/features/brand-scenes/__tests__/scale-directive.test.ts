import { describe, expect, it } from "vitest";
import { buildScaleDirective } from "../prompt/buildScaleDirective";

describe("buildScaleDirective", () => {
  it("uses preset directive when no dimensions given", () => {
    expect(buildScaleDirective({ preset: "pocket" })).toMatch(/~10 cm/);
    expect(buildScaleDirective({ preset: "architectural" })).toMatch(
      /room-scale/i,
    );
  });

  it("uses exact dimensions when provided, overriding preset", () => {
    const out = buildScaleDirective({
      preset: "pocket",
      dimensions: { w: 32, h: 18, d: 12, units: "cm" },
    });
    expect(out).toMatch(/32×18×12 cm/);
    expect(out).not.toMatch(/~10 cm/);
  });

  it("handles 2D dimensions (no depth)", () => {
    const out = buildScaleDirective({
      preset: "handheld",
      dimensions: { w: 10, h: 5, units: "in" },
    });
    expect(out).toMatch(/10×5 in/);
  });
});
