import { z } from "zod";
import {
  TECH_ARCHETYPES,
  TECH_CAMERA_FEELS,
  TECH_MAX_CAMERA_FEELS,
  TECH_PRESENTATIONS,
  TECH_PRESENTATIONS_WITH_PERSON,
  TECH_PRODUCT_TYPES,
  TECH_TEXT_MAX,
} from "./questions";

const archetypeSchema = z.enum(
  TECH_ARCHETYPES.map((a) => a.value) as unknown as [string, ...string[]],
);
const productTypeSchema = z.enum(
  TECH_PRODUCT_TYPES.map((t) => t.value) as unknown as [string, ...string[]],
);
const presentationSchema = z.enum(
  TECH_PRESENTATIONS.map((p) => p.value) as unknown as [string, ...string[]],
);
const cameraFeelSchema = z.enum(
  TECH_CAMERA_FEELS as unknown as [string, ...string[]],
);

const text = z.string().trim().max(TECH_TEXT_MAX);

export const techModuleAnswersSchema = z
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
          .max(TECH_MAX_CAMERA_FEELS)
          .optional(),
      })
      .strict()
      .default({}),
  })
  .strict()
  .refine(
    (v) =>
      !v.scene?.expression ||
      TECH_PRESENTATIONS_WITH_PERSON.includes(
        v.presentation as (typeof TECH_PRESENTATIONS_WITH_PERSON)[number],
      ),
    {
      message:
        "Expression can only be set when an on-model presentation is selected",
      path: ["scene", "expression"],
    },
  );

export type TechModuleAnswers = z.infer<
  typeof techModuleAnswersSchema
>;

export function isTechStepValid(
  a: Partial<TechModuleAnswers>,
): boolean {
  return !!a.archetype && !!a.product_type && !!a.presentation;
}
