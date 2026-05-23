import { z } from "zod";
import {
  HOME_ARCHETYPES,
  HOME_CAMERA_FEELS,
  HOME_MAX_CAMERA_FEELS,
  HOME_PRESENTATIONS,
  HOME_PRESENTATIONS_WITH_PERSON,
  HOME_PRODUCT_TYPES,
  HOME_TEXT_MAX,
} from "./questions";

const archetypeSchema = z.enum(
  HOME_ARCHETYPES.map((a) => a.value) as unknown as [string, ...string[]],
);
const productTypeSchema = z.enum(
  HOME_PRODUCT_TYPES.map((t) => t.value) as unknown as [string, ...string[]],
);
const presentationSchema = z.enum(
  HOME_PRESENTATIONS.map((p) => p.value) as unknown as [string, ...string[]],
);
const cameraFeelSchema = z.enum(
  HOME_CAMERA_FEELS as unknown as [string, ...string[]],
);

const text = z.string().trim().max(HOME_TEXT_MAX);

export const homeModuleAnswersSchema = z
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
          .max(HOME_MAX_CAMERA_FEELS)
          .optional(),
      })
      .strict()
      .default({}),
  })
  .strict()
  .refine(
    (v) =>
      !v.scene?.expression ||
      HOME_PRESENTATIONS_WITH_PERSON.includes(
        v.presentation as (typeof HOME_PRESENTATIONS_WITH_PERSON)[number],
      ),
    {
      message:
        "Expression can only be set when an on-model presentation is selected",
      path: ["scene", "expression"],
    },
  );

export type HomeModuleAnswers = z.infer<
  typeof homeModuleAnswersSchema
>;

export function isHomeStepValid(
  a: Partial<HomeModuleAnswers>,
): boolean {
  return !!a.archetype && !!a.product_type && !!a.presentation;
}
