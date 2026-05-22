import { describe, expect, it } from "vitest";
import {
  SCENE_EXTRAS_FIELDS,
  applicableFields,
  applicableFieldsCtx,
} from "../wizard/constants/extras";
import { resolveAll } from "../wizard/registry/resolvePresets";
import { forbiddenInteractionsByFamily } from "../wizard/rules/combinationGuards";

describe("Phase 7p — product-only camera angles survive cast=none", () => {
  it("footwear/eyewear/jewelry category angles show when cast='none'", () => {
    const footwear = applicableFields(SCENE_EXTRAS_FIELDS, "footwear", "none", "sneakers");
    expect(footwear.map((f) => f.key)).toContain("camera_angle_footwear");

    const eyewear = applicableFields(SCENE_EXTRAS_FIELDS, "eyewear", "none", "eyewear");
    expect(eyewear.map((f) => f.key)).toContain("camera_angle_eyewear");

    const jewelry = applicableFields(SCENE_EXTRAS_FIELDS, "jewelry", "none", "jewellery-rings");
    expect(jewelry.map((f) => f.key)).toContain("camera_angle_jewelry");
  });

  it("apparel angle still hides when cast='none' (every entry needs a person)", () => {
    const fashion = applicableFields(SCENE_EXTRAS_FIELDS, "fashion", "none", "jackets");
    expect(fashion.map((f) => f.key)).not.toContain("camera_angle_apparel");
  });
});

describe("Phase 7p — footwear/shoes keeps full_body focus", () => {
  it("dress shoes include full_body in body_part_focus", () => {
    const shoes = resolveAll("footwear", "shoes");
    expect(shoes.bodyPartFocus).toContain("full_body");
    expect(shoes.bodyPartFocus).toContain("feet");
    expect(shoes.bodyPartFocus).toContain("detail");
  });
});

describe("Phase 7p — eyewear cast presets include hands", () => {
  it("eyewear bundle exposes solo / hands / none", () => {
    const eyewear = resolveAll("eyewear", "eyewear");
    expect(eyewear.castPresets).toEqual(expect.arrayContaining(["solo", "hands", "none"]));
    expect(eyewear.defaultCast).toBe("solo");
  });
});

describe("Phase 7p — hats-caps-beanies forbid 'using'", () => {
  it("forbiddenInteractionsByFamily blocks 'using' for hats family", () => {
    const forbidden = forbiddenInteractionsByFamily("hats-caps-beanies");
    expect(forbidden.has("using")).toBe(true);
    expect(forbidden.has("wearing")).toBe(false);
  });
});

describe("Phase 7p — applicableFieldsCtx still respects cast=none for product angles", () => {
  it("returns camera_angle_footwear when ctx.cast='none'", () => {
    const fields = applicableFieldsCtx(SCENE_EXTRAS_FIELDS, {
      module: "footwear",
      sub_family: "sneakers",
      scene_type: "studio",
      cast: "none",
      values: {},
      auto: {},
      recommendations: {},
    });
    expect(fields.map((f) => f.key)).toContain("camera_angle_footwear");
  });
});
