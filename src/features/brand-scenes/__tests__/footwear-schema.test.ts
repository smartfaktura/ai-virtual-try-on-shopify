import { describe, expect, it } from "vitest";
import { footwearModuleAnswersSchema } from "../modules/footwear/schema";

const base = () => ({
  archetype: "architectural_still_life" as const,
  footwear_type: "sneakers" as const,
  presentation: "pedestal" as const,
  scene: {},
  finishing: {},
});

describe("footwearModuleAnswersSchema", () => {
  it("accepts a minimal valid payload", () => {
    expect(footwearModuleAnswersSchema.safeParse(base()).success).toBe(true);
  });

  it("rejects pose when presentation is pedestal", () => {
    const v = { ...base(), scene: { pose: "mid-stride" } };
    expect(footwearModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("accepts pose when presentation is on_foot_full", () => {
    const v = {
      ...base(),
      presentation: "on_foot_full" as const,
      scene: { pose: "mid-stride" },
    };
    expect(footwearModuleAnswersSchema.safeParse(v).success).toBe(true);
  });

  it("rejects more than 2 camera_feel values", () => {
    const v = {
      ...base(),
      finishing: { camera_feel: ["Macro detail", "Top-down", "Low angle"] },
    };
    expect(footwearModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects unknown footwear_type", () => {
    const v = { ...base(), footwear_type: "rollerblades" };
    expect(footwearModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects unknown archetype", () => {
    const v = { ...base(), archetype: "neon_party" };
    expect(footwearModuleAnswersSchema.safeParse(v).success).toBe(false);
  });
});
