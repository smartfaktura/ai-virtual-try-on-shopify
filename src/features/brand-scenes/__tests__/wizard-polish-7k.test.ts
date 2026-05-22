import { describe, it, expect } from "vitest";
import * as extras from "../wizard/constants/extras";
import { buildsForCast, BUILDS, CROP_SAFETY, STORYTELLING_MOMENT } from "../wizard/constants/extras";

describe("Phase 7k — wizard polish", () => {
  it("removes CAMERA_ANGLES_TABLETOP export (dead code)", () => {
    expect((extras as Record<string, unknown>).CAMERA_ANGLES_TABLETOP).toBeUndefined();
  });

  it("BUILDS for solo cast excludes 'Mixed'", () => {
    expect(buildsForCast("solo")).not.toContain("Mixed");
    expect(buildsForCast("hands")).not.toContain("Mixed");
    expect(buildsForCast("none")).not.toContain("Mixed");
  });

  it("BUILDS for two/group cast keeps 'Mixed'", () => {
    expect(buildsForCast("two")).toContain("Mixed");
    expect(buildsForCast("group")).toContain("Mixed");
    expect(buildsForCast("two")).toEqual(BUILDS);
  });

  it("STORYTELLING_MOMENT fallback is the minimal generic list", () => {
    expect(STORYTELLING_MOMENT).toEqual(["Arriving", "Mid-action", "Resting", "Quiet pause"]);
  });

  it("CROP_SAFETY uses plain-language 'works for square crop' wording", () => {
    expect(CROP_SAFETY).toContain("Center-safe (works for square crop)");
    expect(CROP_SAFETY).not.toContain("Center-safe (1:1 sibling)");
  });
});
