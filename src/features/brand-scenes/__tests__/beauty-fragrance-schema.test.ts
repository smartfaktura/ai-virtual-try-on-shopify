import { describe, expect, it } from "vitest";
import { beautyFragranceModuleAnswersSchema } from "../modules/beauty-fragrance/schema";

const base = () => ({
  archetype: "conceptual_light" as const,
  product_type: "fragrance" as const,
  presentation: "pedestal" as const,
  scene: {},
  finishing: {},
});

describe("beautyFragranceModuleAnswersSchema", () => {
  it("accepts a minimal valid payload", () => {
    expect(beautyFragranceModuleAnswersSchema.safeParse(base()).success).toBe(true);
  });

  it("rejects expression when presentation has no person", () => {
    const v = { ...base(), scene: { expression: "smiling softly" } };
    expect(beautyFragranceModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("accepts expression when presentation has a person", () => {
    const v = {
      ...base(),
      presentation: "with_model" as const,
      scene: { expression: "smiling softly" },
    };
    expect(beautyFragranceModuleAnswersSchema.safeParse(v).success).toBe(true);
  });

  it("rejects more than 2 camera_feel values", () => {
    const v = {
      ...base(),
      finishing: {
        camera_feel: [
          "Macro detail",
          "Soft daylight",
          "Hard light",
        ],
      },
    };
    expect(beautyFragranceModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects unknown product_type", () => {
    const v = { ...base(), product_type: "totally_made_up" };
    expect(beautyFragranceModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects unknown archetype", () => {
    const v = { ...base(), archetype: "neon_rave" };
    expect(beautyFragranceModuleAnswersSchema.safeParse(v).success).toBe(false);
  });
});
