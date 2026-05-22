import { z } from "zod";
import {
  EYEWEAR_ARCHETYPES,
  EYEWEAR_CAMERA_FEELS,
  EYEWEAR_MAX_CAMERA_FEELS,
  EYEWEAR_PRESENTATIONS,
  EYEWEAR_PRESENTATIONS_WITH_PERSON,
  EYEWEAR_TEXT_MAX,
  EYEWEAR_TYPES,
} from "./questions";

const archetypeSchema = z.enum(
  EYEWEAR_ARCHETYPES.map((a) => a.value) as unknown as [string, ...string[]],
);
const typeSchema = z.enum(
  EYEWEAR_TYPES.map((t) => t.value) as unknown as [string, ...string[]],
);
const presentationSchema = z.enum(
  EYEWEAR_PRESENTATIONS.map((p) => p.value) as unknown as [string, ...string[]],
);
const cameraFeelSchema = z.enum(
  EYEWEAR_CAMERA_FEELS as unknown as [string, ...string[]],
);

const text = z.string().trim().max(EYEWEAR_TEXT_MAX);

export const eyewearModuleAnswersSchema = z
  .object({
    archetype: archetypeSchema,
    eyewear_type: typeSchema,
    presentation: presentationSchema,
    scene: z
      .object({
        surface: text.optional(),
        location: text.optional(),
        expression: text.optional(),
      })
      .strict()
      .default({}),
    finishing: z
      .object({
        color_anchor: text.optional(),
        camera_feel: z
          .array(cameraFeelSchema)
          .max(EYEWEAR_MAX_CAMERA_FEELS)
          .optional(),
      })
      .strict()
      .default({}),
  })
  .strict()
  .refine(
    (v) =>
      !v.scene?.expression ||
      EYEWEAR_PRESENTATIONS_WITH_PERSON.includes(
        v.presentation as (typeof EYEWEAR_PRESENTATIONS_WITH_PERSON)[number],
      ),
    {
      message:
        "Expression can only be set when an on-model presentation is selected",
      path: ["scene", "expression"],
    },
  );

export type EyewearModuleAnswers = z.infer<typeof eyewearModuleAnswersSchema>;

export function isEyewearStepValid(
  a: Partial<EyewearModuleAnswers>,
): boolean {
  return !!a.archetype && !!a.eyewear_type && !!a.presentation;
}
