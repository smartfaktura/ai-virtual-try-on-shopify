import { describe, expect, it } from "vitest";
import { hatsCapsBeaniesModuleAnswersSchema } from "../modules/hats-caps-beanies/schema";

const base = () => ({
  archetype: "studio_portrait" as const,
  product_type: "cap" as const,
  presentation: "pedestal" as const,
  scene: {},
  finishing: {},
});

describe("hatsCapsBeaniesModuleAnswersSchema", () => {
  it("accepts a minimal valid payload", () => {
    expect(hatsCapsBeaniesModuleAnswersSchema.safeParse(base()).success).toBe(true);
  });

  it("rejects expression when presentation has no person", () => {
    const v = { ...base(), scene: { expression: "smiling softly" } };
    expect(hatsCapsBeaniesModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("accepts expression when presentation has a person", () => {
    const v = {
      ...base(),
      presentation: "on_model_face" as const,
      scene: { expression: "smiling softly" },
    };
    expect(hatsCapsBeaniesModuleAnswersSchema.safeParse(v).success).toBe(true);
  });

  it("rejects more than 2 camera_feel values", () => {
    const v = {
      ...base(),
      finishing: {
        camera_feel: [
          "Soft daylight",
          "Studio strobe",
          "Wide editorial",
        ],
      },
    };
    expect(hatsCapsBeaniesModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects unknown product_type", () => {
    const v = { ...base(), product_type: "totally_made_up" };
    expect(hatsCapsBeaniesModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects unknown archetype", () => {
    const v = { ...base(), archetype: "neon_rave" };
    expect(hatsCapsBeaniesModuleAnswersSchema.safeParse(v).success).toBe(false);
  });
});
