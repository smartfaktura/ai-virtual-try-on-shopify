import { describe, expect, it } from "vitest";
import { foodDrinkModuleAnswersSchema } from "../modules/food-drink/schema";

const base = () => ({
  archetype: "overhead_tableau" as const,
  product_type: "beverage" as const,
  presentation: "top_down" as const,
  scene: {},
  finishing: {},
});

describe("foodDrinkModuleAnswersSchema", () => {
  it("accepts a minimal valid payload", () => {
    expect(foodDrinkModuleAnswersSchema.safeParse(base()).success).toBe(true);
  });

  it("rejects expression when presentation has no person", () => {
    const v = { ...base(), scene: { expression: "smiling softly" } };
    expect(foodDrinkModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("accepts expression when presentation has a person", () => {
    const v = {
      ...base(),
      presentation: "paired_with_hands" as const,
      scene: { expression: "smiling softly" },
    };
    expect(foodDrinkModuleAnswersSchema.safeParse(v).success).toBe(true);
  });

  it("rejects more than 2 camera_feel values", () => {
    const v = {
      ...base(),
      finishing: {
        camera_feel: [
          "Top-down",
          "Macro detail",
          "Soft daylight",
        ],
      },
    };
    expect(foodDrinkModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects unknown product_type", () => {
    const v = { ...base(), product_type: "totally_made_up" };
    expect(foodDrinkModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects unknown archetype", () => {
    const v = { ...base(), archetype: "neon_rave" };
    expect(foodDrinkModuleAnswersSchema.safeParse(v).success).toBe(false);
  });
});
