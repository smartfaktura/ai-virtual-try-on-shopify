import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(__dirname, "..");

describe("Phase 7s · quick/detailed wizard mode + Step 5 dedup", () => {
  it("QuickDetailedToggle component is wired up", () => {
    const src = readFileSync(
      resolve(ROOT, "wizard/components/QuickDetailedToggle.tsx"),
      "utf8",
    );
    expect(src).toMatch(/useWizardMode/);
    expect(src).toMatch(/brand-scene-wizard:mode/);
    expect(src).toMatch(/Quick/);
    expect(src).toMatch(/Detailed/);
  });

  it("Step4Cast hides optional dials in quick mode", () => {
    const src = readFileSync(
      resolve(ROOT, "wizard/steps/Step4Cast.tsx"),
      "utf8",
    );
    // Toggle imported + mode flag derived
    expect(src).toMatch(/QuickDetailedToggle/);
    expect(src).toMatch(/const isQuick = mode === "quick"/);
    // Optional sections gated by !isQuick
    expect(src).toMatch(/!isQuick && hasPeople && !isReplicate/);
    expect(src).toMatch(/!isQuick && !isReplicate && \(/);
    // Customize escape hatch present
    expect(src).toMatch(/CustomizeLink/);
  });

  it("Step4ModuleQuestions passes mode prop and renders toggle", () => {
    const src = readFileSync(
      resolve(ROOT, "wizard/steps/Step4ModuleQuestions.tsx"),
      "utf8",
    );
    expect(src).toMatch(/QuickDetailedToggle/);
    expect(src).toMatch(/mode={mode}/);
  });

  it("FashionQuestions removed redundant Setting block", () => {
    const src = readFileSync(
      resolve(ROOT, "modules/fashion/FashionQuestions.tsx"),
      "utf8",
    );
    expect(src).not.toMatch(/FASHION_SETTINGS/);
    expect(src).not.toMatch(/label="Setting"/);
    expect(src).toMatch(/mode\?\: WizardMode/);
  });

  it("FootwearQuestions removed Scene setting block", () => {
    const src = readFileSync(
      resolve(ROOT, "modules/footwear/FootwearQuestions.tsx"),
      "utf8",
    );
    expect(src).not.toMatch(/label="Scene setting"/);
    expect(src).not.toMatch(/PRESENTATIONS_WITH_PERSON/);
    expect(src).toMatch(/mode\?\: WizardMode/);
  });

  it("EyewearQuestions removed Scene setting block", () => {
    const src = readFileSync(
      resolve(ROOT, "modules/eyewear/EyewearQuestions.tsx"),
      "utf8",
    );
    expect(src).not.toMatch(/label="Scene setting"/);
    expect(src).not.toMatch(/EYEWEAR_PRESENTATIONS_WITH_PERSON/);
    expect(src).toMatch(/mode\?\: WizardMode/);
  });
});
