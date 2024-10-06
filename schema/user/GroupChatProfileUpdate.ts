import { z } from "zod";
import { NameAndProfilePicSchema } from "./UserUpdateProfileSchema";

export const GroupChatProfileUpdateSchema = z
  .object({
    chatRoomId: z.string({
      required_error: "chatRoomId is missing",
    }),
  })
  .merge(NameAndProfilePicSchema)
  .refine((data) => data.updatedName !== null || data.updatedProfilePicture !== null, {
    message: "Either updatedName or updatedProfilePicture must be provided",
    path: ["updatedName", "updatedProfilePicture"],
  });

export type GroupChatProfileUpdate = z.infer<typeof GroupChatProfileUpdateSchema>;
