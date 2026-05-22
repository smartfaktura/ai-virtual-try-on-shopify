import { describe, expect, it } from "vitest";
import { fashionModuleAnswersSchema } from "../modules/fashion/schema";

const base = () => ({
  wearer: "on_model_full" as const,
  scene: {},
  finishing: {},
});

describe("fashionModuleAnswersSchema", () => {
  it("accepts a minimal valid payload (wearer only)", () => {
    expect(fashionModuleAnswersSchema.safeParse(base()).success).toBe(true);
  });

  it("still accepts legacy payloads with archetype + garment_focus", () => {
    const v = {
      ...base(),
      archetype: "editorial_studio" as const,
      garment_focus: ["Outerwear"],
    };
    expect(fashionModuleAnswersSchema.safeParse(v).success).toBe(true);
  });

  it("rejects empty garment_focus when supplied", () => {
    const v = { ...base(), garment_focus: [] };
    expect(fashionModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects more than 3 garments", () => {
    const v = {
      ...base(),
      garment_focus: ["Outerwear", "Knitwear", "Denim", "Tops"],
    };
    expect(fashionModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects more than 2 camera_feel values", () => {
    const v = {
      ...base(),
      finishing: { camera_feel: ["35mm film", "Soft DOF", "Flash-lit"] },
    };
    expect(fashionModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("rejects pose when wearer is flat_lay", () => {
    const v = {
      ...base(),
      wearer: "flat_lay" as const,
      scene: { pose: "leaning relaxed" },
    };
    expect(fashionModuleAnswersSchema.safeParse(v).success).toBe(false);
  });

  it("accepts pose when wearer is on_model_crop", () => {
    const v = {
      ...base(),
      wearer: "on_model_crop" as const,
      scene: { pose: "leaning relaxed" },
    };
    expect(fashionModuleAnswersSchema.safeParse(v).success).toBe(true);
  });

  it("rejects unknown archetype value", () => {
    const v = { ...base(), archetype: "noir_jazz" };
    expect(fashionModuleAnswersSchema.safeParse(v).success).toBe(false);
  });
});
