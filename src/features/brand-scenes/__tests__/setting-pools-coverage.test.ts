import { describe, it, expect } from "vitest";
import { SUB_TYPES_BY_FAMILY, FAMILY_NAME_TO_ID } from "@/lib/onboardingTaxonomy";
import { getSettingPool, SCENE_TYPES } from "../wizard/registry/settingsBySubfamily";

describe("Phase 7g — every onboarding sub-family has ≥1 non-empty pool for ≥2 scene types", () => {
  for (const [familyName, subs] of Object.entries(SUB_TYPES_BY_FAMILY)) {
    const moduleId = FAMILY_NAME_TO_ID[familyName];
    if (!moduleId) continue;
    for (const sub of subs) {
      it(`${moduleId}/${sub.slug}`, () => {
        const hit = SCENE_TYPES.filter(
          (t) => getSettingPool(moduleId, sub.slug, t.value).length > 0,
        );
        expect(hit.length).toBeGreaterThanOrEqual(2);
      });
    }
  }
});
