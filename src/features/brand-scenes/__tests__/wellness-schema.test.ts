import { describe, expect, it } from "vitest";
import { wellnessModuleAnswersSchema } from "../modules/wellness/schema";

const base = () => ({
  archetype: "spa_tableau" as const,
  product_type: "supplement" as const,
  presentation: "pedestal" as const,
  scene: {},
  finishing: {},
});

describe("wellnessModuleAnswersSchema", () => {
  it("accepts a minimal valid payload", () => {
    expect(wellnessModuleAnswersSchema.safeParse(base()).success).toBe(true);
  });

  it("rejects expression when presentation has no person", () => {
    const v = { ...base(), scene: { expression: "smiling softly" } };
    expect(wellnessModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("accepts expression when presentation has a person", () => {
    const v = {
      ...base(),
      presentation: "in_use_with_model" as const,
      scene: { expression: "smiling softly" },
    };
    expect(wellnessModuleAnswersSchema.safeParse(v).success).toBe(true);
  });

  it("rejects more than 2 camera_feel values", () => {
    const v = {
      ...base(),
      finishing: {
        camera_feel: [
          "Soft daylight",
          "Macro detail",
          "Top-down",
        ],
      },
    };
    expect(wellnessModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects unknown product_type", () => {
    const v = { ...base(), product_type: "totally_made_up" };
    expect(wellnessModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects unknown archetype", () => {
    const v = { ...base(), archetype: "neon_rave" };
    expect(wellnessModuleAnswersSchema.safeParse(v).success).toBe(false);
  });
});
