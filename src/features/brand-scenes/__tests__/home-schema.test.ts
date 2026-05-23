import { describe, expect, it } from "vitest";
import { homeModuleAnswersSchema } from "../modules/home/schema";

const base = () => ({
  archetype: "lived_in_interior" as const,
  product_type: "furniture" as const,
  presentation: "in_room" as const,
  scene: {},
  finishing: {},
});

describe("homeModuleAnswersSchema", () => {
  it("accepts a minimal valid payload", () => {
    expect(homeModuleAnswersSchema.safeParse(base()).success).toBe(true);
  });

  it("rejects expression when presentation has no person", () => {
    const v = { ...base(), scene: { expression: "smiling softly" } };
    expect(homeModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("accepts expression when presentation has a person", () => {
    const v = {
      ...base(),
      presentation: "paired_with_model" as const,
      scene: { expression: "smiling softly" },
    };
    expect(homeModuleAnswersSchema.safeParse(v).success).toBe(true);
  });

  it("rejects more than 2 camera_feel values", () => {
    const v = {
      ...base(),
      finishing: {
        camera_feel: [
          "Wide editorial",
          "Soft daylight",
          "Top-down",
        ],
      },
    };
    expect(homeModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects unknown product_type", () => {
    const v = { ...base(), product_type: "totally_made_up" };
    expect(homeModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects unknown archetype", () => {
    const v = { ...base(), archetype: "neon_rave" };
    expect(homeModuleAnswersSchema.safeParse(v).success).toBe(false);
  });
});
