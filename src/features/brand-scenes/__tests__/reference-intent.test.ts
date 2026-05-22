import { describe, expect, it } from "vitest";
import { buildReferenceDirective } from "../prompt/buildReferenceDirective";

describe("buildReferenceDirective", () => {
  it("returns empty when no intent", () => {
    expect(buildReferenceDirective(undefined)).toBe("");
  });

  it("emits a locked prefix for replicate", () => {
    expect(buildReferenceDirective("replicate")).toMatch(/do not alter/i);
  });

  it("emits a location-keeping prefix for location intent", () => {
    expect(buildReferenceDirective("location")).toMatch(/keep the reference location/i);
  });

  it("emits a framing-keeping prefix for composition intent", () => {
    expect(buildReferenceDirective("composition")).toMatch(/framing, camera angle/i);
  });

  it("emits a loose-inspiration prefix for vibe intent", () => {
    expect(buildReferenceDirective("vibe")).toMatch(/loose inspiration/i);
  });
});
