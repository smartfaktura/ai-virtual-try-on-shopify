/**
 * Brand Scenes — Zod runtime validation.
 * Mirrors the DB `protect_brand_scene_writes` trigger as a double safety net.
 */

import { z } from "zod";
import {
  BRAND_SCENE_KEY_PREFIX,
  BRAND_SCENE_MODULES,
  BRAND_SCENE_SCHEMA_VERSION,
} from "./constants";

export const brandSceneModuleSchema = z.enum(
  BRAND_SCENE_MODULES as unknown as [string, ...string[]],
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

export const brandSceneAnswersSchema = z
  .object({
    module: brandSceneModuleSchema,
    base: brandSceneBaseAnswersSchema,
    module_answers: z.record(z.unknown()),
  })
  .strict();

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
      message:
        "brand_scene_answers.module must match brand_scene_module",
      path: ["brand_scene_answers", "module"],
    },
  );

export type BrandSceneDraftInput = z.input<typeof brandSceneDraftSchema>;
export type BrandSceneDraftParsed = z.output<typeof brandSceneDraftSchema>;
