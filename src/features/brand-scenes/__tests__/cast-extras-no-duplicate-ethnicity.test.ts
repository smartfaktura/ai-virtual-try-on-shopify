import { describe, it, expect } from "vitest";
import { CAST_EXTRAS_FIELDS, applicableFields } from "../wizard/constants/extras";

describe("Phase 7j — ethnicity is not duplicated in CAST_EXTRAS_FIELDS", () => {
  it("never includes a generic ethnicity field (handled by EthnicityChips)", () => {
    expect(CAST_EXTRAS_FIELDS.find((f) => f.key === "ethnicity")).toBeUndefined();
  });

  it("applicableFields never surfaces ethnicity regardless of cast/subFamily", () => {
    for (const cast of ["solo", "two", "group", "hands", "none"] as const) {
      const out = applicableFields(CAST_EXTRAS_FIELDS, "fashion", cast, "hoodies");
      expect(out.some((f) => f.key === "ethnicity")).toBe(false);
    }
  });
});
