import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { StageCGroup } from "../wizard/components/StageCGroup";
import { Chip } from "../wizard/components/Chip";

const ROOT = resolve(__dirname, "../wizard");

describe("Phase 7q · wizard UI polish", () => {
  it("BUG-3 — no wizard subtitle ends with a period", () => {
    const src = readFileSync(resolve(ROOT, "BrandSceneWizard.tsx"), "utf8");
    // Pull out every `subtitle: "..."` literal and check it doesn't end with `.`
    const matches = [...src.matchAll(/subtitle:\s*\n?\s*"([^"]+)"/g)].map(
      (m) => m[1],
    );
    expect(matches.length).toBeGreaterThan(0);
    for (const s of matches) {
      expect(s.endsWith(".")).toBe(false);
    }
  });

  it("BUG-1 — scroll handler targets #app-main-scroll", () => {
    const src = readFileSync(resolve(ROOT, "BrandSceneWizard.tsx"), "utf8");
    expect(src).toMatch(/getElementById\("app-main-scroll"\)/);
    expect(src).not.toMatch(/data-wizard-root/);
  });

  it("BUG-4 — 'Category-tuned' chip removed from Step3BaseAnswers", () => {
    const src = readFileSync(
      resolve(ROOT, "steps/Step3BaseAnswers.tsx"),
      "utf8",
    );
    expect(src).not.toMatch(/Category-tuned/);
    expect(src).not.toMatch(/tuningLabel/);
  });

  it("BUG-5 — Stage A/B/C jargon removed from section labels", () => {
    const src = readFileSync(
      resolve(ROOT, "steps/Step3BaseAnswers.tsx"),
      "utf8",
    );
    expect(src).not.toMatch(/Stage A ·/);
    expect(src).not.toMatch(/Stage B ·/);
    expect(src).not.toMatch(/Stage C ·/);
    // Phase 7r — Stage C wrapper rebranded to "Optional fine-tuning".
    expect(src).toMatch(/Optional fine-tuning/);

  });

  it("BUG-5 — 'More cast & styling dials' label removed from Step4Cast", () => {
    const src = readFileSync(resolve(ROOT, "steps/Step4Cast.tsx"), "utf8");
    expect(src).not.toMatch(/More cast & styling dials/);
  });

  it("BUG-2 — PaletteBlock and PillFieldInner inputs no longer use autoFocus", () => {
    const src = readFileSync(
      resolve(ROOT, "steps/Step3BaseAnswers.tsx"),
      "utf8",
    );
    expect(src).not.toMatch(/autoFocus/);
  });

  it("BUG-6 — Stage C ExtrasPillField is rendered with showAllInitially", () => {
    const src = readFileSync(
      resolve(ROOT, "steps/Step3BaseAnswers.tsx"),
      "utf8",
    );
    expect(src).toMatch(/showAllInitially/);
  });

  it("BUG-7 — StageCGroup renders a '· N set' summary when count > 0", () => {
    const { container, rerender } = render(
      <StageCGroup label="Backdrop & floor" count={0}>
        <div>x</div>
      </StageCGroup>,
    );
    expect(container.textContent).not.toMatch(/set/);
    rerender(
      <StageCGroup label="Backdrop & floor" count={3}>
        <div>x</div>
      </StageCGroup>,
    );
    expect(container.textContent).toMatch(/· 3 set/);
  });

  it("BUG-8 — Chip uses responsive padding/text classes", () => {
    const { container } = render(<Chip>label</Chip>);
    const btn = container.querySelector("button")!;
    expect(btn.className).toMatch(/px-3/);
    expect(btn.className).toMatch(/py-1\.5/);
    expect(btn.className).toMatch(/text-\[13px\]/);
    expect(btn.className).toMatch(/sm:px-4/);
    expect(btn.className).toMatch(/sm:py-2/);
    expect(btn.className).toMatch(/sm:text-sm/);
  });
});
