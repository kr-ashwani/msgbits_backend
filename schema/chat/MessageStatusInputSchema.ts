import { z } from "zod";

export const MessageStatusInputSchema = z.array(
  z.object({
    chatRoomId: z.string({
      required_error: "chatRoomId is required",
    }),
    messageId: z.string({
      required_error: "messageId is required",
    }),
  }),
  {
    required_error: "message status Name is required",
  }
);

export type MessageStatusInput = z.infer<typeof MessageStatusInputSchema>;
export type MessageStatusOutput = {
  messageIds: string[];
  userId: string;
};
