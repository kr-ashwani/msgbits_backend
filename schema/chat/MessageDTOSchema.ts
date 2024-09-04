import { z } from "zod";
import { FileDTOSchema } from "./FileDTOSchema";

const MessageDTOBaseSchema = z.object({
  chatRoomId: z.string({
    required_error: "chatRoomId is required",
  }),
  messageId: z.string({
    required_error: "MessageId is required",
  }),
  message: z.string({
    required_error: "Message is required",
  }),
  senderId: z.string({
    required_error: "SenderId is required",
  }),
  status: z.enum(["pending", "sent", "delivered", "read", "failed"], {
    required_error: "Status is required",
  }),
  repliedTo: z.union([z.string(), z.null()]),
  createdAt: z.string({
    required_error: "createdAt is required",
  }),
  updatedAt: z.string({
    required_error: "updatedAt is required",
  }),
});

const TextMessageDTOSchema = MessageDTOBaseSchema.extend({
  type: z.literal("text"),
});

const FileMessageDTOSchema = MessageDTOBaseSchema.extend({
  type: z.literal("file"),
  file: FileDTOSchema,
});

export const MessageDTOSchema = z.discriminatedUnion("type", [
  TextMessageDTOSchema,
  FileMessageDTOSchema,
]);

export type MessageBaseDTO = z.infer<typeof MessageDTOBaseSchema>;
export type TextMessageDTO = z.infer<typeof TextMessageDTOSchema>;
export type FileMessageDTO = z.infer<typeof FileMessageDTOSchema>;
export type MessageDTO = z.infer<typeof MessageDTOSchema>;
