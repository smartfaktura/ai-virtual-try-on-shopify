import { describe, expect, it } from "vitest";
import { techModuleAnswersSchema } from "../modules/tech/schema";

const base = () => ({
  archetype: "studio_floating" as const,
  product_type: "phone_tablet" as const,
  presentation: "floating" as const,
  scene: {},
  finishing: {},
});

describe("techModuleAnswersSchema", () => {
  it("accepts a minimal valid payload", () => {
    expect(techModuleAnswersSchema.safeParse(base()).success).toBe(true);
  });

  it("rejects expression when presentation has no person", () => {
    const v = { ...base(), scene: { expression: "smiling softly" } };
    expect(techModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("accepts expression when presentation has a person", () => {
    const v = {
      ...base(),
      presentation: "in_hand" as const,
      scene: { expression: "smiling softly" },
    };
    expect(techModuleAnswersSchema.safeParse(v).success).toBe(true);
  });

  it("rejects more than 2 camera_feel values", () => {
    const v = {
      ...base(),
      finishing: {
        camera_feel: [
          "Macro detail",
          "Hard light",
          "Studio strobe",
        ],
      },
    };
    expect(techModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects unknown product_type", () => {
    const v = { ...base(), product_type: "totally_made_up" };
    expect(techModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects unknown archetype", () => {
    const v = { ...base(), archetype: "neon_rave" };
    expect(techModuleAnswersSchema.safeParse(v).success).toBe(false);
  });
});
