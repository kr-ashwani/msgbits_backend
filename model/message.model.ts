import { Schema, model } from "mongoose";

// Base interface for all message types
interface IMessageBase {
  chatRoomId: string;
  messageId: string;
  message: string;
  senderId: string;
  status: "sent";
  repliedTo: string | null;
  createdAt: Date;
  updatedAt: Date;
  deliveredTo: string[];
  seenBy: string[];
}

// Interface for text messages
interface ITextMessage extends IMessageBase {
  type: "text";
}

// Interface for timestamp messages
interface IInfoMessage extends IMessageBase {
  type: "info";
}

// Interface for file messages
interface IFileMessage extends IMessageBase {
  type: "file";
  fileId: string;
}

// Messsage interface
export type IMessage = ITextMessage | IInfoMessage | IFileMessage;

// Mongoose schema definition
const messageSchema = new Schema<IMessage>(
  {
    chatRoomId: {
      type: String,
      required: [true, "Chat room ID is required"],
    },
    messageId: {
      type: String,
      required: [true, "Message ID is required"],
    },
    message: {
      type: String,
      required: [
        function (this: IMessage) {
          return this.type === "text";
        },
        "Message is required for text messages",
      ],
    },
    senderId: {
      type: String,
      required: [true, "Sender ID is required"],
    },
    status: {
      type: String,
      required: false,
      default: "sent",
    },
    repliedTo: {
      type: String,
      default: null,
    },
    deliveredTo: {
      type: [String],
      required: [true, "deliveredTo is required"],
      default: [],
    },
    seenBy: {
      type: [String],
      required: [true, "seenBy is required"],
      default: [],
    },
    type: {
      type: String,
      enum: ["text", "info", "file"],
      required: [true, "Message type is required"],
    },
    fileId: {
      type: String,
      required: [
        function (this: IMessage) {
          return this.type === "file";
        },
        "File ID is required for file messages",
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Model creation
const MessageModel = model<IMessage>("Message", messageSchema);

export default MessageModel;
