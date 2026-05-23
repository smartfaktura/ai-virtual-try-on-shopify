import { describe, expect, it } from "vitest";
import { bagsAccessoriesModuleAnswersSchema } from "../modules/bags-accessories/schema";

const base = () => ({
  archetype: "carried_editorial" as const,
  product_type: "tote" as const,
  presentation: "standing_pedestal" as const,
  scene: {},
  finishing: {},
});

describe("bagsAccessoriesModuleAnswersSchema", () => {
  it("accepts a minimal valid payload", () => {
    expect(bagsAccessoriesModuleAnswersSchema.safeParse(base()).success).toBe(true);
  });

  it("rejects expression when presentation has no person", () => {
    const v = { ...base(), scene: { expression: "smiling softly" } };
    expect(bagsAccessoriesModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("accepts expression when presentation has a person", () => {
    const v = {
      ...base(),
      presentation: "on_model_carrying" as const,
      scene: { expression: "smiling softly" },
    };
    expect(bagsAccessoriesModuleAnswersSchema.safeParse(v).success).toBe(true);
  });

  it("rejects more than 2 camera_feel values", () => {
    const v = {
      ...base(),
      finishing: {
        camera_feel: [
          "Wide editorial",
          "Macro detail",
          "Top-down",
        ],
      },
    };
    expect(bagsAccessoriesModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects unknown product_type", () => {
    const v = { ...base(), product_type: "totally_made_up" };
    expect(bagsAccessoriesModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects unknown archetype", () => {
    const v = { ...base(), archetype: "neon_rave" };
    expect(bagsAccessoriesModuleAnswersSchema.safeParse(v).success).toBe(false);
  });
});
