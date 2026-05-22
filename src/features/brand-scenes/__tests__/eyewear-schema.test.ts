import { describe, expect, it } from "vitest";
import { eyewearModuleAnswersSchema } from "../modules/eyewear/schema";

const base = () => ({
  archetype: "studio_portrait" as const,
  eyewear_type: "sunglasses" as const,
  presentation: "pedestal" as const,
  scene: {},
  finishing: {},
});

describe("eyewearModuleAnswersSchema", () => {
  it("accepts a minimal valid payload", () => {
    expect(eyewearModuleAnswersSchema.safeParse(base()).success).toBe(true);
  });

  it("rejects expression when presentation is pedestal", () => {
    const v = { ...base(), scene: { expression: "chin tilted up" } };
    expect(eyewearModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("accepts expression when presentation is on_model_face", () => {
    const v = {
      ...base(),
      presentation: "on_model_face" as const,
      scene: { expression: "chin tilted up" },
    };
    expect(eyewearModuleAnswersSchema.safeParse(v).success).toBe(true);
  });

  it("rejects more than 2 camera_feel values", () => {
    const v = {
      ...base(),
      finishing: { camera_feel: ["Macro detail", "Top-down", "Low angle"] },
    };
    expect(eyewearModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects unknown eyewear_type", () => {
    const v = { ...base(), eyewear_type: "monocle" };
    expect(eyewearModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects unknown archetype", () => {
    const v = { ...base(), archetype: "neon_rave" };
    expect(eyewearModuleAnswersSchema.safeParse(v).success).toBe(false);
  });
});
