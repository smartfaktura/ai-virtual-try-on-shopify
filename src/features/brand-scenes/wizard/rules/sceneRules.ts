/**
 * Phase 7g — Declarative rule engine for cross-field cascades + soft warnings.
 *
 * Freedom-first: cascades are RECOMMENDATIONS, not locks.
 *  - Auto-set values are marked in `auto`.
 *  - The "what would have been recommended" is also stored in `recommendations`
 *    so the user can clear a value and re-apply it with one click.
 *  - softWarnings() returns informational notes only — never blocks Next.
 */

import type { BrandSceneModule } from "../../constants";
import type { CastPreset } from "../constants/cast";
import type { SceneTypeId } from "../registry/settingsBySubfamily";

export interface SceneCtx {
  module?: BrandSceneModule;
  sub_family?: string;
  scene_type?: SceneTypeId;
  setting?: string;
  cast?: CastPreset;
  values: Record<string, string | undefined>;
  auto: Record<string, true>;
  /** Recommended values surfaced as ✦ chips even after the user clears them. */
  recommendations?: Record<string, string>;
}

export interface CascadeRule {
  id: string;
  trigger: { key: string; value?: string | RegExp };
  cascade: (ctx: SceneCtx) => Record<string, string | undefined>;
  autoMark?: string[];
}

const matches = (v: string | undefined, m: string | RegExp | undefined): boolean => {
  if (m === undefined) return !!v;
  if (typeof m === "string") return v === m;
  return !!v && m.test(v);
};

export const SCENE_RULES: CascadeRule[] = [
  {
    id: "two-tone-split-colors",
    trigger: { key: "backdrop_type", value: "Two-tone hard split" },
    cascade: (ctx) => ({
      backdrop_color_a: ctx.values.backdrop_color_a ?? "Warm white",
      backdrop_color_b: ctx.values.backdrop_color_b ?? "Charcoal",
    }),
    autoMark: ["backdrop_color_a", "backdrop_color_b"],
  },
  {
    id: "gradient-direction-seed",
    trigger: { key: "backdrop_type", value: "Soft gradient wall" },
    cascade: (ctx) => ({
      gradient_direction: ctx.values.gradient_direction ?? "Top → bottom",
    }),
    autoMark: ["gradient_direction"],
  },
  {
    id: "beach-defaults",
    trigger: { key: "_setting_changed", value: /Beach|Coastal|Ocean|Lagoon|Shore|Cliff edge above sea/i },
    cascade: () => ({
      time_of_day_detail: "Golden hour evening",
      motion: "Hair in motion",
      light_direction: "Back-lit silhouette",
    }),
    autoMark: ["time_of_day_detail", "motion", "light_direction"],
  },
  {
    id: "snow-defaults",
    trigger: { key: "_setting_changed", value: /Snow|Snowy|Winter alley/i },
    cascade: () => ({
      time_of_day_detail: "Overcast noon",
      light_quality: "Softbox diffuse",
    }),
    autoMark: ["time_of_day_detail", "light_quality"],
  },
  {
    id: "studio-defaults",
    trigger: { key: "_setting_changed", value: /Cyclorama|Seamless|Plinth|Painted (gradient|plaster)/i },
    cascade: () => ({
      light_quality: "Softbox diffuse",
      time_of_day_detail: "Studio (timeless)",
    }),
    autoMark: ["light_quality", "time_of_day_detail"],
  },
];

/**
 * Apply cascades. Never overwrites a user-set (non-auto) value.
 * Stores recommendations in `recommendations` so cleared fields can be
 * re-applied with one click.
 */
export function applyCascade(
  key: string,
  newValue: string | undefined,
  ctx: SceneCtx,
): {
  values: Record<string, string | undefined>;
  auto: Record<string, true>;
  recommendations: Record<string, string>;
} {
  const values = { ...ctx.values, [key]: newValue };
  const auto = { ...ctx.auto };
  const recommendations = { ...(ctx.recommendations ?? {}) };
  // The user explicitly set this key — drop its auto mark.
  delete auto[key];

  for (const rule of SCENE_RULES) {
    if (rule.trigger.key !== key) continue;
    if (!matches(newValue, rule.trigger.value)) continue;
    const seeded = rule.cascade({ ...ctx, values, auto, recommendations });
    for (const [k, v] of Object.entries(seeded)) {
      if (v === undefined) continue;
      // Always record the recommendation (regardless of current value).
      recommendations[k] = v;
      const isUserSet = values[k] && !auto[k];
      if (isUserSet) continue; // protect user picks
      values[k] = v;
      if (rule.autoMark?.includes(k)) auto[k] = true;
    }
  }
  return { values, auto, recommendations };
}

/**
 * Helper used by Setting (Stage B) — cascades triggered by the chosen setting
 * string (key="_setting_changed").
 */
export function applySettingCascade(
  setting: string | undefined,
  ctx: SceneCtx,
) {
  return applyCascade("_setting_changed", setting, { ...ctx, setting });
}

/**
 * Soft warnings — informational only, never block Next.
 * Examples: "Jacket on tropical beach — unusual but go for it."
 */
export function softWarnings(ctx: SceneCtx): string[] {
  const out: string[] = [];
  const sf = ctx.sub_family ?? "";
  const setting = (ctx.setting ?? "").toLowerCase();

  if (/jackets|coats/i.test(sf) && /beach|tropical|lagoon|pool/.test(setting)) {
    out.push("Jackets in a tropical / beach setting — unusual pairing, but the AI will try.");
  }
  if (/swimwear/i.test(sf) && /snow|winter|mountain pass/.test(setting)) {
    out.push("Swimwear in a cold setting — high concept, the AI may struggle with realism.");
  }
  if (/boots/i.test(sf) && /beach|pool|tropical/.test(setting)) {
    out.push("Boots on a beach — unusual; the AI may downplay the boots.");
  }
  if (/high-heels|heels/i.test(sf) && /trail|mountain|forest/.test(setting)) {
    out.push("Heels on rough terrain — concept shot, expect a stylised result.");
  }
  if (ctx.scene_type === "studio" && /rain|fog|smoke|snow/.test(ctx.values._weather ?? "")) {
    out.push("Studio + outdoor weather — use Studio FX (rain rig, haze) to make it convincing.");
  }
  return out;
}
