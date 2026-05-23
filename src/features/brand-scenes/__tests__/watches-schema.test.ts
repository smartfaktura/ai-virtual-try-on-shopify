import { describe, expect, it } from "vitest";
import { watchesModuleAnswersSchema } from "../modules/watches/schema";

const base = () => ({
  archetype: "wrist_editorial" as const,
  product_type: "dress" as const,
  presentation: "pedestal" as const,
  scene: {},
  finishing: {},
});

describe("watchesModuleAnswersSchema", () => {
  it("accepts a minimal valid payload", () => {
    expect(watchesModuleAnswersSchema.safeParse(base()).success).toBe(true);
  });

  it("rejects expression when presentation has no person", () => {
    const v = { ...base(), scene: { expression: "smiling softly" } };
    expect(watchesModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("accepts expression when presentation has a person", () => {
    const v = {
      ...base(),
      presentation: "on_wrist_closeup" as const,
      scene: { expression: "smiling softly" },
    };
    expect(watchesModuleAnswersSchema.safeParse(v).success).toBe(true);
  });

  it("rejects more than 2 camera_feel values", () => {
    const v = {
      ...base(),
      finishing: {
        camera_feel: [
          "Macro detail",
          "Top-down",
          "Low angle",
        ],
      },
    };
    expect(watchesModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects unknown product_type", () => {
    const v = { ...base(), product_type: "totally_made_up" };
    expect(watchesModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects unknown archetype", () => {
    const v = { ...base(), archetype: "neon_rave" };
    expect(watchesModuleAnswersSchema.safeParse(v).success).toBe(false);
  });
});
