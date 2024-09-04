import { z } from "zod";

export const FileDTOSchema = z.object({
  fileId: z.string({
    required_error: "FileId is required",
  }),
  fileName: z.string({
    required_error: "File Name is required",
  }),
  size: z.number({
    required_error: "Size is required",
  }),
  fileType: z.string({
    required_error: "File Type is required",
  }),
  extension: z.string({
    required_error: "File Extension is required",
  }),
  url: z.string({
    required_error: "File URL is required",
  }),
  dimension: z.object(
    {
      width: z.number({
        required_error: "Width is required",
      }),
      height: z.number({
        required_error: "Height is required",
      }),
    },
    { required_error: "File Dimension is required" }
  ),
});

export type FileDTO = z.infer<typeof FileDTOSchema>;
