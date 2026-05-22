import { describe, expect, it } from "vitest";
import { brandSceneAnswersSchema } from "../schema";

const base = {
  module: "fashion" as const,
  sub_family: "hoodies",
  base: {},
  module_answers: {},
};

describe("brandSceneAnswersSchema — source fork", () => {
  it("accepts source: 'wizard' with no reference paths", () => {
    const v = { ...base, source: "wizard" as const };
    expect(brandSceneAnswersSchema.safeParse(v).success).toBe(true);
  });

  it("accepts source: 'reference' with a single reference path", () => {
    const v = {
      ...base,
      source: "reference" as const,
      reference_image_paths: ["uid/a.jpg"],
      reference_preview_url: "https://example.com/a.jpg",
      name: "Linen morning kitchen",
      placement_hint: "held in the model's hand",
    };
    expect(brandSceneAnswersSchema.safeParse(v).success).toBe(true);
  });

  it("rejects source: 'wizard' with reference paths attached", () => {
    const v = {
      ...base,
      source: "wizard" as const,
      reference_image_paths: ["uid/a.jpg"],
    };
    expect(brandSceneAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects more than 1 reference image", () => {
    const v = {
      ...base,
      source: "reference" as const,
      reference_image_paths: ["a", "b"],
    };
    expect(brandSceneAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects placement_hint on wizard path", () => {
    const v = {
      ...base,
      source: "wizard" as const,
      placement_hint: "lower-right third",
    };
    expect(brandSceneAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects unknown source value", () => {
    const v = { ...base, source: "magic" };
    expect(brandSceneAnswersSchema.safeParse(v).success).toBe(false);
  });
});
