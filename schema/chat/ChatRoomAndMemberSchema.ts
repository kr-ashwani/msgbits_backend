import { z } from "zod";

export const ChatRoomAndMemberSchema = z.object({
  chatRoomId: z.string({
    required_error: "chatRoomId is missing",
  }),
  memberId: z.string({
    required_error: "newMember is missing",
  }),
});

export type ChatRoomAndMember = z.infer<typeof ChatRoomAndMemberSchema>;
