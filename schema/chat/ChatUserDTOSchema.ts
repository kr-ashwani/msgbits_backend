import { z } from "zod";

export const ChatUserDTOSchema = z.object({
  name: z.string({
    required_error: "Name is required",
  }),
  email: z
    .string({
      required_error: "Password is required",
    })
    .email(),
  createdAt: z.string({
    required_error: "createdAt is required",
  }),
  updatedAt: z.string({
    required_error: "updatedAt is required",
  }),
  _id: z.string({
    required_error: "_id is required",
  }),
  profilePicture: z.string({
    required_error: "Profile picture is required",
  }),
  profileColor: z.string({
    required_error: "profile color is required",
  }),
  lastOnline: z.string({
    required_error: "last online is required",
  }),
});

export type ChatUserDTO = z.infer<typeof ChatUserDTOSchema>;
