import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Step5Review } from "../wizard/steps/Step5Review";
import { assembleSceneDirective } from "../prompt/assembleSceneDirective";
import type { BrandSceneAnswers } from "../types";

const baseAnswers: BrandSceneAnswers = {
  source: "wizard",
  module: "fashion",
  sub_family: "tops",
  base: {},
  module_answers: {},
};

describe("Step5Review summary — Phase 7l", () => {
  it("renders Scene type from base.scene_type, not legacy aesthetic", () => {
    const { container } = render(
      <Step5Review
        answers={{
          ...baseAnswers,
          base: { scene_type: "outdoor_nature" },
        }}
      />,
    );
    expect(container.textContent).toContain("Scene type");
    expect(container.textContent).toContain("Outdoor nature");
  });

  it("surfaces extras.time_of_day_detail in the Look & light bucket", () => {
    const { container } = render(
      <Step5Review
        answers={{
          ...baseAnswers,
          base: { extras: { time_of_day_detail: "Golden hour evening" } },
        }}
      />,
    );
    expect(container.textContent).toContain("Time of day (detail)");
    expect(container.textContent).toContain("Golden hour evening");
  });

  it("omits empty buckets (no Cast section when cast is undefined)", () => {
    const { container } = render(<Step5Review answers={baseAnswers} />);
    expect(container.textContent).not.toMatch(/\bCast\b/);
  });
});

describe("assembleSceneDirective — Phase 7l time-of-day dedup", () => {
  it("emits only the extras Time line, never a duplicate Time of day", () => {
    const out = assembleSceneDirective({
      ...baseAnswers,
      base: { extras: { time_of_day_detail: "Golden hour evening" } },
    });
    expect(out).toContain("Time: Golden hour evening.");
    expect(out).not.toMatch(/Time of day:/);
  });
});
