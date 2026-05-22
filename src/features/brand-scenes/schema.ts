/**
 * Brand Scenes — Zod runtime validation.
 * Mirrors the DB `protect_brand_scene_writes` trigger as a double safety net.
 */

import { z } from "zod";
import {
  BRAND_SCENE_KEY_PREFIX,
  BRAND_SCENE_MODULES,
  BRAND_SCENE_NAME_MAX,
  BRAND_SCENE_NOTE_MAX,
  BRAND_SCENE_PLACEMENT_MAX,
  BRAND_SCENE_SCHEMA_VERSION,
  BRAND_SCENE_SOURCES,
  BRAND_SCENE_REFERENCE_MAX_IMAGES,
  type BrandSceneModule,
} from "./constants";
import {
  FAMILY_ID_TO_NAME,
  SUB_TYPES_BY_FAMILY,
} from "@/lib/onboardingTaxonomy";

export const brandSceneModuleSchema = z.enum(
  BRAND_SCENE_MODULES as unknown as [string, ...string[]],
);

export const brandSceneSourceSchema = z.enum(
  BRAND_SCENE_SOURCES as unknown as [string, ...string[]],
);

export const brandSceneBaseAnswersSchema = z
  .object({
    aesthetic: z.string().trim().min(1).max(120).optional(),
    palette: z.array(z.string().trim().min(1).max(40)).max(8).optional(),
    mood: z.string().trim().min(1).max(120).optional(),
    lighting: z.string().trim().min(1).max(120).optional(),
    location: z.string().trim().min(1).max(160).optional(),
    framing: z.string().trim().min(1).max(120).optional(),
    notes: z.string().trim().max(600).optional(),
  })
  .strict();

/** Sub-family slugs allowed for a given module id. */
export function getSubFamilySlugs(module: BrandSceneModule): string[] {
  const famName = FAMILY_ID_TO_NAME[module];
  if (!famName) return [];
  return (SUB_TYPES_BY_FAMILY[famName] ?? []).map((s) => s.slug);
}

export const brandSceneAnswersSchema = z
  .object({
    source: brandSceneSourceSchema,
    module: brandSceneModuleSchema,
    sub_family: z.string().trim().min(1),
    base: brandSceneBaseAnswersSchema,
    module_answers: z.record(z.unknown()),
    reference_image_paths: z
      .array(z.string().trim().min(1).max(512))
      .max(BRAND_SCENE_REFERENCE_MAX_IMAGES)
      .optional(),
    reference_preview_url: z.string().trim().url().max(2048).optional(),
    placement_hint: z.string().trim().max(BRAND_SCENE_PLACEMENT_MAX).optional(),
    name: z.string().trim().min(1).max(BRAND_SCENE_NAME_MAX).optional(),
    note: z.string().trim().max(BRAND_SCENE_NOTE_MAX).optional(),
  })
  .strict()
  .refine(
    (v) => getSubFamilySlugs(v.module as BrandSceneModule).includes(v.sub_family),
    {
      message: "sub_family must belong to the chosen module's family",
      path: ["sub_family"],
    },
  )
  .refine(
    (v) =>
      v.source === "wizard"
        ? !v.reference_image_paths || v.reference_image_paths.length === 0
        : true,
    {
      message: "reference_image_paths only allowed when source is 'reference'",
      path: ["reference_image_paths"],
    },
  )
  .refine(
    (v) =>
      v.source === "wizard"
        ? !v.placement_hint && !v.reference_preview_url
        : true,
    {
      message:
        "placement_hint and reference_preview_url only allowed when source is 'reference'",
      path: ["placement_hint"],
    },
  );

export const brandSceneDraftSchema = z
  .object({
    scene_key: z
      .string()
      .trim()
      .min(BRAND_SCENE_KEY_PREFIX.length + 1)
      .max(120)
      .refine((v) => v.startsWith(BRAND_SCENE_KEY_PREFIX), {
        message: `scene_key must start with "${BRAND_SCENE_KEY_PREFIX}"`,
      }),
    category_collection: z
      .string()
      .trim()
      .min(1)
      .refine((v) => v !== "bundle", {
        message: 'category_collection "bundle" is reserved for admin scenes',
      }),
    is_active: z.boolean(),
    is_brand_scene: z.literal(true),
    owner_user_id: z.string().uuid(),
    brand_scene_module: brandSceneModuleSchema,
    brand_scene_schema_version: z.literal(BRAND_SCENE_SCHEMA_VERSION),
    brand_scene_answers: brandSceneAnswersSchema,
    source_generation_id: z.string().uuid().nullable().optional(),
    sort_order: z.number().int().min(0),
  })
  .strict()
  .refine(
    (v) => v.brand_scene_answers.module === v.brand_scene_module,
    {
      message: "brand_scene_answers.module must match brand_scene_module",
      path: ["brand_scene_answers", "module"],
    },
  )
  .refine(
    (v) => v.brand_scene_answers.sub_family === v.category_collection,
    {
      message:
        "category_collection must equal brand_scene_answers.sub_family",
      path: ["category_collection"],
    },
  );

export type BrandSceneDraftInput = z.input<typeof brandSceneDraftSchema>;
export type BrandSceneDraftParsed = z.output<typeof brandSceneDraftSchema>;
