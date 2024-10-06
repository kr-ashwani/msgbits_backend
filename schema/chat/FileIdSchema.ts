import { z } from "zod";

export const FileIdSchema = z.object({
  fileId: z.string({
    required_error: "FileId is required",
  }),
});

export type FileId = z.infer<typeof FileIdSchema>;
