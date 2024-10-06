import { Schema, model } from "mongoose";

// Interface for File document
export interface IFile {
  fileId: string;
  fileName: string;
  size: number; // Size in bytes
  fileType: string; // MIME type
  extension: string; // File extension
  url: string;
  dimension: {
    width: number;
    height: number;
  } | null;
}

// Mongoose schema for File
const fileSchema = new Schema<IFile>(
  {
    fileId: {
      type: String,
      required: [true, "File ID is required"],
      unique: true,
    },
    fileName: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
    },
    size: {
      type: Number,
      required: [true, "File size is required"],
      min: [1, "File size must be greater than 0"],
    },
    fileType: {
      type: String,
      required: [true, "File type is required"],
      trim: true,
    },
    extension: {
      type: String,
      required: [true, "File extension is required"],
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[a-zA-Z0-9]+$/.test(v);
        },
        message: (props: { value: string }) => `${props.value} is not a valid file extension`,
      },
    },
    url: {
      type: String,
      required: [true, "File URL is required"],
      trim: true,
    },
    dimension: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Model creation
const FileModel = model<IFile>("File", fileSchema);

export default FileModel;
