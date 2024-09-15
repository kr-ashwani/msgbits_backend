import { z } from "zod";

export const LeaveChatRoomSchema = z.object({
  chatRoomId: z.string({
    required_error: "chatRoomId is required",
  }),
  memberId: z.string({
    required_error: "memeberId is required",
  }),
});

export type LeaveChatRoom = z.infer<typeof LeaveChatRoomSchema>;
