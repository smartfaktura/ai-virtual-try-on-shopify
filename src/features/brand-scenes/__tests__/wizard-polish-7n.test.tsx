import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Step5Review } from "../wizard/steps/Step5Review";
import { assembleSceneDirective } from "../prompt/assembleSceneDirective";
import { buildCastDirective } from "../prompt/buildCastDirective";
import type { BrandSceneAnswers } from "../types";

const baseAnswers: BrandSceneAnswers = {
  source: "wizard",
  module: "fashion",
  sub_family: "tops",
  base: {},
  module_answers: {},
};

describe("assembleSceneDirective — Phase 7n ethnicity emission", () => {
  it("emits clean 'Ethnicity:' line when cast.extras.ethnicity is set", () => {
    const out = assembleSceneDirective({
      ...baseAnswers,
      cast: { preset: "solo", extras: { ethnicity: "Pan-European" } },
    });
    expect(out).toContain("Ethnicity: Pan-European.");
    expect(out).not.toContain("Cast style (ethnicity)");
  });

  it("emits only one ethnicity line (no fallback double-emit)", () => {
    const out = assembleSceneDirective({
      ...baseAnswers,
      cast: { preset: "solo", extras: { ethnicity: "East Asian" } },
    });
    const matches = out.match(/Ethnicity:|Cast style \(ethnicity\)/g) ?? [];
    expect(matches).toHaveLength(1);
  });

  it("does not emit ethnicity when unset", () => {
    const out = assembleSceneDirective({
      ...baseAnswers,
      cast: { preset: "solo" },
    });
    expect(out).not.toMatch(/Ethnicity:/);
  });
});

describe("buildCastDirective — Phase 7n cast.diversity retired", () => {
  it("ignores legacy cast.diversity values", () => {
    const out = buildCastDirective({
      preset: "solo",
      age: ["adult"],
      // legacy field; intentionally cast through unknown for back-compat input
      diversity: "diverse" as unknown as never,
    } as unknown as Parameters<typeof buildCastDirective>[0]);
    expect(out).not.toMatch(/diverse/i);
  });
});

describe("Step5Review — Phase 7n Ethnicity row", () => {
  it("renders Ethnicity row when cast.extras.ethnicity is set", () => {
    const { container } = render(
      <Step5Review
        answers={{
          ...baseAnswers,
          cast: { preset: "solo", extras: { ethnicity: "Pan-European" } },
        }}
      />,
    );
    expect(container.textContent).toContain("Ethnicity");
    expect(container.textContent).toContain("Pan-European");
  });

  it("omits Ethnicity row when unset", () => {
    const { container } = render(
      <Step5Review
        answers={{ ...baseAnswers, cast: { preset: "solo" } }}
      />,
    );
    expect(container.textContent).not.toMatch(/Ethnicity/);
  });
});
