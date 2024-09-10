import { z } from "zod";

export const SyncUpdateInputSchema = z.object({
  chatRoom: z.record(
    z.string(),
    z.object({
      lastMessageTimestamp: z.string().nullable(),
      lastUpdateTimestamp: z.string({
        required_error: "ChatRoom last update timestamp is required",
      }),
    })
  ),
  lastChatUserCreatedAt: z.string().nullable(),
});

export type SyncUpdateInput = z.infer<typeof SyncUpdateInputSchema>;
