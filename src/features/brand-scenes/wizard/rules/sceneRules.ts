/**
 * Phase 7f — Declarative rule engine for cross-field cascades.
 *
 * Each rule fires when its trigger key transitions to a matching value.
 * Cascade results are applied to extras only when the target field is
 * empty OR currently auto-filled (never overwrites user picks).
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
}

export interface CascadeRule {
  id: string;
  /** Trigger by extras key + (optional) value match. */
  trigger: { key: string; value?: string | RegExp };
  /** Returns extras values to seed; `undefined` clears the key. */
  cascade: (ctx: SceneCtx) => Record<string, string | undefined>;
  /** Auto-mark these resulting keys (so we know the user didn't pick them). */
  autoMark?: string[];
}

const matches = (v: string | undefined, m: string | RegExp | undefined): boolean => {
  if (m === undefined) return !!v;
  if (typeof m === "string") return v === m;
  return !!v && m.test(v);
};

export const SCENE_RULES: CascadeRule[] = [
  // ─── Backdrop two-tone hard split → seed two colors ──────────────────
  {
    id: "two-tone-split-colors",
    trigger: { key: "backdrop_type", value: "Two-tone hard split" },
    cascade: (ctx) => {
      const a = ctx.values.backdrop_color_a ?? "Warm white";
      const b = ctx.values.backdrop_color_b ?? "Charcoal";
      return { backdrop_color_a: a, backdrop_color_b: b };
    },
    autoMark: ["backdrop_color_a", "backdrop_color_b"],
  },
  // ─── Soft gradient → seed direction ──────────────────────────────────
  {
    id: "gradient-direction-seed",
    trigger: { key: "backdrop_type", value: "Soft gradient wall" },
    cascade: (ctx) => ({
      gradient_direction: ctx.values.gradient_direction ?? "Top → bottom",
    }),
    autoMark: ["gradient_direction"],
  },
  // ─── Rain in studio → unlock studio_fx + wet shadows hint ────────────
  {
    id: "rain-in-studio",
    trigger: { key: "studio_fx", value: /./ },
    cascade: () => ({}),
    // Reverse direction handled below via weather rule.
  },
  // ─── Beach setting → cascade golden hour + breeze ────────────────────
  {
    id: "beach-defaults",
    trigger: { key: "_setting_changed", value: /Beach|Coastal|Ocean/i },
    cascade: () => ({
      time_of_day_detail: "Golden hour evening",
      motion: "Hair in motion",
      light_direction: "Back-lit silhouette",
    }),
    autoMark: ["time_of_day_detail", "motion", "light_direction"],
  },
];

/**
 * Apply cascades triggered by a single key change. Returns new values + auto map.
 * Never overwrites a user-set (non-auto) value.
 */
export function applyCascade(
  key: string,
  newValue: string | undefined,
  ctx: SceneCtx,
): { values: Record<string, string | undefined>; auto: Record<string, true> } {
  const values = { ...ctx.values, [key]: newValue };
  const auto = { ...ctx.auto };
  // The user explicitly set this key — drop its auto mark.
  delete auto[key];

  for (const rule of SCENE_RULES) {
    if (rule.trigger.key !== key) continue;
    if (!matches(newValue, rule.trigger.value)) continue;
    const seeded = rule.cascade({ ...ctx, values, auto });
    for (const [k, v] of Object.entries(seeded)) {
      const isUserSet = values[k] && !auto[k];
      if (isUserSet) continue; // protect user picks
      if (v === undefined) {
        delete values[k];
        delete auto[k];
      } else {
        values[k] = v;
        if (rule.autoMark?.includes(k)) auto[k] = true;
      }
    }
  }
  return { values, auto };
}

/**
 * Helper used by Setting (Stage B) — cascades that depend on the chosen setting
 * string rather than an extras key. We fake the trigger via key="_setting_changed".
 */
export function applySettingCascade(
  setting: string | undefined,
  ctx: SceneCtx,
): { values: Record<string, string | undefined>; auto: Record<string, true> } {
  return applyCascade("_setting_changed", setting, { ...ctx, setting });
}
