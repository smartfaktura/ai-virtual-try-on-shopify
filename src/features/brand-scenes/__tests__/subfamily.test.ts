import { describe, expect, it } from "vitest";
import { brandSceneAnswersSchema } from "../schema";

const base = {
  base: {},
  module_answers: {},
};

describe("brandSceneAnswersSchema — sub_family validation", () => {
  it("accepts a valid (fashion, hoodies) pair", () => {
    const v = {
      ...base,
      source: "wizard" as const,
      module: "fashion" as const,
      sub_family: "hoodies",
    };
    expect(brandSceneAnswersSchema.safeParse(v).success).toBe(true);
  });

  it("rejects sub_family that does not belong to the family", () => {
    const v = {
      ...base,
      source: "wizard" as const,
      module: "footwear" as const,
      sub_family: "hoodies",
    };
    expect(brandSceneAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("accepts the single-option eyewear sub-family", () => {
    const v = {
      ...base,
      source: "wizard" as const,
      module: "eyewear" as const,
      sub_family: "eyewear",
    };
    expect(brandSceneAnswersSchema.safeParse(v).success).toBe(true);
  });

  it("rejects an unknown sub_family slug", () => {
    const v = {
      ...base,
      source: "wizard" as const,
      module: "fashion" as const,
      sub_family: "not-a-real-slug",
    };
    expect(brandSceneAnswersSchema.safeParse(v).success).toBe(false);
  });
});
