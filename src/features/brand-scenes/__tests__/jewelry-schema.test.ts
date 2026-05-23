import { describe, expect, it } from "vitest";
import { jewelryModuleAnswersSchema } from "../modules/jewelry/schema";

const base = () => ({
  archetype: "editorial_portrait" as const,
  product_type: "ring" as const,
  presentation: "pedestal" as const,
  scene: {},
  finishing: {},
});

describe("jewelryModuleAnswersSchema", () => {
  it("accepts a minimal valid payload", () => {
    expect(jewelryModuleAnswersSchema.safeParse(base()).success).toBe(true);
  });

  it("rejects expression when presentation has no person", () => {
    const v = { ...base(), scene: { expression: "smiling softly" } };
    expect(jewelryModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("accepts expression when presentation has a person", () => {
    const v = {
      ...base(),
      presentation: "on_model_closeup" as const,
      scene: { expression: "smiling softly" },
    };
    expect(jewelryModuleAnswersSchema.safeParse(v).success).toBe(true);
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
    expect(jewelryModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects unknown product_type", () => {
    const v = { ...base(), product_type: "totally_made_up" };
    expect(jewelryModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects unknown archetype", () => {
    const v = { ...base(), archetype: "neon_rave" };
    expect(jewelryModuleAnswersSchema.safeParse(v).success).toBe(false);
  });
});
