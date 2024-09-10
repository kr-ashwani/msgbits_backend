import { z } from "zod";

const ChatRoomDTOBaseSchema = z.object({
  chatRoomId: z.string({
    required_error: "chatRoomId is required",
  }),
  members: z.array(
    z.string({
      required_error: "Members is required",
    }),
    {
      required_error: "Members is required",
    }
  ),
  createdBy: z.string({
    required_error: "createdBy is required",
  }),
  createdAt: z.string({
    required_error: "createdAt is required",
  }),
  updatedAt: z.string({
    required_error: "updatedAt is required",
  }),
  lastMessageId: z.string({
    required_error: "lastMessageId is required",
  }),
});

const PrivateChatRoomDTOSchema = ChatRoomDTOBaseSchema.extend({
  type: z.literal("private"),
});

const GroupChatRoomDTOSchema = ChatRoomDTOBaseSchema.extend({
  type: z.literal("group"),
  chatName: z.string({
    required_error: "Chat Name is required",
  }),
  chatRoomPicture: z.string({
    required_error: "Chat Room Picture is required",
  }),
  admins: z.array(
    z.string({
      required_error: "Admins is required",
    }),
    {
      required_error: "Admins is required",
    }
  ),
});

export const ChatRoomDTOSchema = z.discriminatedUnion("type", [
  PrivateChatRoomDTOSchema,
  GroupChatRoomDTOSchema,
]);
export type ChatRoomBaseDTO = z.infer<typeof ChatRoomDTOBaseSchema>;
export type GroupChatRoomDTO = z.infer<typeof GroupChatRoomDTOSchema>;
export type PrivateChatRoomDTO = z.infer<typeof PrivateChatRoomDTOSchema>;
export type ChatRoomDTO = z.infer<typeof ChatRoomDTOSchema>;
