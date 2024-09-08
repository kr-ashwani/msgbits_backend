import { z } from "zod";

export const SyncUpdateInputSchema = z.record(
  z.string(),
  z.object({
    lastMessageTimestamp: z
      .string({
        required_error: "Last Message timestamp is required",
      })
      .nullable(),
    lastUpdateTimestamp: z.string({
      required_error: "ChatRoom last update timestamp is required",
    }),
  })
);

export type SyncUpdateInput = z.infer<typeof SyncUpdateInputSchema>;
