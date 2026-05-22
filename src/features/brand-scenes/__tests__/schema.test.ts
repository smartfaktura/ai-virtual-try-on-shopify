import { describe, expect, it } from "vitest";
import {
  BRAND_SCENE_SCHEMA_VERSION,
  brandSceneDraftSchema,
} from "../index";

const validDraft = () => ({
  scene_key: "brand-apparel-cozy-loft-001",
  category_collection: "apparel",
  is_active: true,
  is_brand_scene: true as const,
  owner_user_id: "11111111-1111-1111-1111-111111111111",
  brand_scene_module: "apparel" as const,
  brand_scene_schema_version: BRAND_SCENE_SCHEMA_VERSION,
  brand_scene_answers: {
    module: "apparel" as const,
    base: { aesthetic: "minimal", mood: "calm" },
    module_answers: {},
  },
  sort_order: 0,
});

describe("brandSceneDraftSchema", () => {
  it("accepts a valid draft", () => {
    expect(brandSceneDraftSchema.safeParse(validDraft()).success).toBe(true);
  });

  it("rejects scene_key without brand- prefix", () => {
    const d = validDraft();
    d.scene_key = "apparel-cozy-loft-001";
    expect(brandSceneDraftSchema.safeParse(d).success).toBe(false);
  });

  it('rejects category_collection "bundle"', () => {
    const d = validDraft();
    d.category_collection = "bundle";
    expect(brandSceneDraftSchema.safeParse(d).success).toBe(false);
  });

  it("rejects wrong schema_version", () => {
    const d = validDraft();
    (d as { brand_scene_schema_version: number }).brand_scene_schema_version =
      999;
    expect(brandSceneDraftSchema.safeParse(d).success).toBe(false);
  });

  it("rejects unknown module", () => {
    const d = validDraft();
    (d as { brand_scene_module: string }).brand_scene_module = "spaceship";
    expect(brandSceneDraftSchema.safeParse(d).success).toBe(false);
  });

  it("rejects answers.module mismatch with brand_scene_module", () => {
    const d = validDraft();
    (d.brand_scene_answers as { module: string }).module = "footwear";
    expect(brandSceneDraftSchema.safeParse(d).success).toBe(false);
  });

  it("rejects negative sort_order", () => {
    const d = validDraft();
    d.sort_order = -1;
    expect(brandSceneDraftSchema.safeParse(d).success).toBe(false);
  });
});
