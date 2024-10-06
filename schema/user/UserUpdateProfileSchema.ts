import { z } from "zod";

// Common part of the schema
export const NameAndProfilePicSchema = z.object({
  updatedName: z
    .string({
      required_error: "updatedName is missing",
    })
    .nullable(),
  updatedProfilePicture: z
    .string({
      required_error: "updatedProfilePicture is missing",
    })
    .nullable(),
});

export const UserUpdateProfileSchema = z
  .object({
    userId: z.string({
      required_error: "userId is missing",
    }),
  })
  .merge(NameAndProfilePicSchema)
  .refine((data) => data.updatedName !== null || data.updatedProfilePicture !== null, {
    message: "Either updatedName or updatedProfilePicture must be provided",
    path: ["updatedName", "updatedProfilePicture"],
  });

export type UserUpdateProfile = z.infer<typeof UserUpdateProfileSchema>;
