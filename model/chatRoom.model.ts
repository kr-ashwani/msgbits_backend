import { Schema, Types, model } from "mongoose";

// Base interface for chat rooms
interface IChatRoomBase {
  chatRoomId: string;
  members: string[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  lastMessageId: string;
}

// Interface for private chat rooms
interface IPrivateChatRoom extends IChatRoomBase {
  type: "private";
}

// Interface for group chat rooms
interface IGroupChatRoom extends IChatRoomBase {
  type: "group";
  chatName: string;
  chatRoomPicture: string;
  admins: string[];
}

// Chat Room interface
export type IChatRoom = IPrivateChatRoom | IGroupChatRoom;

// Validation function for group-specific fields
const isGroupChat = function (this: IChatRoom) {
  return this.type === "group";
};

// chatRoom schema
const chatRoomSchema = new Schema<IChatRoom>(
  {
    chatRoomId: {
      type: String,
      required: [true, "Chat room ID is required"],
      unique: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: [true, "Created by is required"],
      ref: "User", // Assuming you're referencing the User model
    },
    members: {
      type: [String],
      required: [true, "At least one member is required for a chat room"],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: "Members array must contain at least one member",
      },
    },
    lastMessageId: {
      type: String,
      required: [true, "lastMessageId is required"],
    },
    type: {
      type: String,
      enum: {
        values: ["private", "group"],
        message: "{VALUE} is not a valid chat room type",
      },
      required: [true, "Chat room type is required"],
    },
    chatName: {
      type: String,
      required: [isGroupChat, "Chat name is required for group chats"],
    },
    chatRoomPicture: {
      type: String,
      required: [isGroupChat, "Chat room picture is required for group chats"],
    },
    admins: {
      type: [String],
      required: [isGroupChat, "At least one admin is required for group chats"],
      validate: {
        validator: function (this: IChatRoom, v: string[]) {
          return this.type !== "group" || (Array.isArray(v) && v.length > 0);
        },
        message: "Admins array must contain at least one admin for group chats",
      },
    },
  },
  {
    timestamps: true,
  }
);

const ChatRoomModel = model<IChatRoom>("ChatRoom", chatRoomSchema);

export default ChatRoomModel;
