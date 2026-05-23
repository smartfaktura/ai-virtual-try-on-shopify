import { z } from "zod";
import {
  JEWELRY_ARCHETYPES,
  JEWELRY_CAMERA_FEELS,
  JEWELRY_MAX_CAMERA_FEELS,
  JEWELRY_PRESENTATIONS,
  JEWELRY_PRESENTATIONS_WITH_PERSON,
  JEWELRY_PRODUCT_TYPES,
  JEWELRY_TEXT_MAX,
} from "./questions";

const archetypeSchema = z.enum(
  JEWELRY_ARCHETYPES.map((a) => a.value) as unknown as [string, ...string[]],
);
const productTypeSchema = z.enum(
  JEWELRY_PRODUCT_TYPES.map((t) => t.value) as unknown as [string, ...string[]],
);
const presentationSchema = z.enum(
  JEWELRY_PRESENTATIONS.map((p) => p.value) as unknown as [string, ...string[]],
);
const cameraFeelSchema = z.enum(
  JEWELRY_CAMERA_FEELS as unknown as [string, ...string[]],
);

const text = z.string().trim().max(JEWELRY_TEXT_MAX);

export const jewelryModuleAnswersSchema = z
  .object({
    archetype: archetypeSchema,
    product_type: productTypeSchema,
    presentation: presentationSchema,
    scene: z
      .object({
        surface: text.optional(),
        location: text.optional(),
        mood: text.optional(),
        expression: text.optional(),
      })
      .strict()
      .default({}),
    finishing: z
      .object({
        color_anchor: text.optional(),
        camera_feel: z
          .array(cameraFeelSchema)
          .max(JEWELRY_MAX_CAMERA_FEELS)
          .optional(),
      })
      .strict()
      .default({}),
  })
  .strict()
  .refine(
    (v) =>
      !v.scene?.expression ||
      JEWELRY_PRESENTATIONS_WITH_PERSON.includes(
        v.presentation as (typeof JEWELRY_PRESENTATIONS_WITH_PERSON)[number],
      ),
    {
      message:
        "Expression can only be set when an on-model presentation is selected",
      path: ["scene", "expression"],
    },
  );

export type JewelryModuleAnswers = z.infer<
  typeof jewelryModuleAnswersSchema
>;

export function isJewelryStepValid(
  a: Partial<JewelryModuleAnswers>,
): boolean {
  return !!a.archetype && !!a.product_type && !!a.presentation;
}
