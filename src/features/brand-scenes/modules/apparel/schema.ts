import { z } from "zod";
import {
  APPAREL_ARCHETYPES,
  APPAREL_CAMERA_FEELS,
  APPAREL_GARMENTS,
  APPAREL_MAX_CAMERA_FEELS,
  APPAREL_MAX_GARMENTS,
  APPAREL_TEXT_MAX,
  APPAREL_WEARERS,
  WEARERS_WITH_PERSON,
} from "./questions";

const archetypeSchema = z.enum(
  APPAREL_ARCHETYPES.map((a) => a.value) as unknown as [string, ...string[]],
);
const wearerSchema = z.enum(
  APPAREL_WEARERS.map((w) => w.value) as unknown as [string, ...string[]],
);
const garmentSchema = z.enum(APPAREL_GARMENTS as unknown as [string, ...string[]]);
const cameraFeelSchema = z.enum(
  APPAREL_CAMERA_FEELS as unknown as [string, ...string[]],
);

const text = z.string().trim().max(APPAREL_TEXT_MAX);

export const apparelModuleAnswersSchema = z
  .object({
    archetype: archetypeSchema,
    garment_focus: z.array(garmentSchema).min(1).max(APPAREL_MAX_GARMENTS),
    wearer: wearerSchema,
    scene: z
      .object({
        location: text.optional(),
        props: text.optional(),
        pose: text.optional(),
      })
      .strict()
      .default({}),
    finishing: z
      .object({
        color_anchor: text.optional(),
        camera_feel: z
          .array(cameraFeelSchema)
          .max(APPAREL_MAX_CAMERA_FEELS)
          .optional(),
      })
      .strict()
      .default({}),
  })
  .strict()
  .refine(
    (v) =>
      !v.scene?.pose ||
      WEARERS_WITH_PERSON.includes(v.wearer as (typeof WEARERS_WITH_PERSON)[number]),
    {
      message: "Pose can only be set when an on-model wearer is selected",
      path: ["scene", "pose"],
    },
  );

export type ApparelModuleAnswers = z.infer<typeof apparelModuleAnswersSchema>;
