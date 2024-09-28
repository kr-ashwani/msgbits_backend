import { z } from "zod";

export const UserUpdateProfileSchema = z
  .object({
    userId: z.string({
      required_error: "userId is missing",
    }),
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
  })
  .refine(
    (data) => data.updatedName !== null || data.updatedProfilePicture !== null,
    {
      message: "Either updatedName or updatedProfilePicture must be provided",
      path: ["updatedName", "updatedProfilePicture"], // Error will be shown for both fields
    },
  );

export type UserUpdateProfile = z.infer<typeof UserUpdateProfileSchema>;
