import { z } from "zod";
import {
  FOOTWEAR_ARCHETYPES,
  FOOTWEAR_CAMERA_FEELS,
  FOOTWEAR_MAX_CAMERA_FEELS,
  FOOTWEAR_PRESENTATIONS,
  FOOTWEAR_TEXT_MAX,
  FOOTWEAR_TYPES,
  PRESENTATIONS_WITH_PERSON,
} from "./questions";

const archetypeSchema = z.enum(
  FOOTWEAR_ARCHETYPES.map((a) => a.value) as unknown as [string, ...string[]],
);
const typeSchema = z.enum(
  FOOTWEAR_TYPES.map((t) => t.value) as unknown as [string, ...string[]],
);
const presentationSchema = z.enum(
  FOOTWEAR_PRESENTATIONS.map((p) => p.value) as unknown as [string, ...string[]],
);
const cameraFeelSchema = z.enum(
  FOOTWEAR_CAMERA_FEELS as unknown as [string, ...string[]],
);

const text = z.string().trim().max(FOOTWEAR_TEXT_MAX);

export const footwearModuleAnswersSchema = z
  .object({
    archetype: archetypeSchema,
    footwear_type: typeSchema,
    presentation: presentationSchema,
    scene: z
      .object({
        surface: text.optional(),
        location: text.optional(),
        pose: text.optional(),
      })
      .strict()
      .default({}),
    finishing: z
      .object({
        color_anchor: text.optional(),
        camera_feel: z
          .array(cameraFeelSchema)
          .max(FOOTWEAR_MAX_CAMERA_FEELS)
          .optional(),
      })
      .strict()
      .default({}),
  })
  .strict()
  .refine(
    (v) =>
      !v.scene?.pose ||
      PRESENTATIONS_WITH_PERSON.includes(
        v.presentation as (typeof PRESENTATIONS_WITH_PERSON)[number],
      ),
    {
      message: "Pose can only be set when an on-foot presentation is selected",
      path: ["scene", "pose"],
    },
  );

export type FootwearModuleAnswers = z.infer<typeof footwearModuleAnswersSchema>;

export function isFootwearStepValid(
  a: Partial<FootwearModuleAnswers>,
): boolean {
  return !!a.archetype && !!a.footwear_type && !!a.presentation;
}
