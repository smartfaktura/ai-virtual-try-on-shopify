import { describe, expect, it } from "vitest";
import { brandSceneAnswersSchema } from "../schema";

describe("brandSceneAnswersSchema — reference path round-trip", () => {
  it("accepts a complete reference-path payload", () => {
    const v = {
      source: "reference" as const,
      module: "fashion" as const,
      sub_family: "hoodies",
      base: {},
      module_answers: {},
      reference_image_paths: ["uid/abc.jpg"],
      reference_preview_url:
        "https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/brand-scene-references/uid/abc.jpg",
      name: "Marble counter morning",
      placement_hint: "resting on the marble counter, lower-right third",
      note: "keep mood quieter than reference",
    };
    const r = brandSceneAnswersSchema.safeParse(v);
    expect(r.success).toBe(true);
  });

  it("accepts reference path with no optional placement/note", () => {
    const v = {
      source: "reference" as const,
      module: "fashion" as const,
      sub_family: "hoodies",
      base: {},
      module_answers: {},
      reference_image_paths: ["uid/abc.jpg"],
      name: "Linen kitchen",
    };
    expect(brandSceneAnswersSchema.safeParse(v).success).toBe(true);
  });

  it("rejects placement_hint over 120 chars", () => {
    const v = {
      source: "reference" as const,
      module: "fashion" as const,
      sub_family: "hoodies",
      base: {},
      module_answers: {},
      reference_image_paths: ["uid/abc.jpg"],
      placement_hint: "x".repeat(121),
    };
    expect(brandSceneAnswersSchema.safeParse(v).success).toBe(false);
  });
});
