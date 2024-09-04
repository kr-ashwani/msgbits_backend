import { z } from "zod";
import { ChatRoomDTOSchema } from "../../schema/chat/ChatRoomDTOSchema";
import { MessageDTOSchema } from "../../schema/chat/MessageDTOSchema";
import { ChatUserDTOSchema } from "../../schema/chat/ChatUserDTOSchema";

export interface ChatRoomEmitterMapping {
  "chatroom-op": string;
}

export interface MessageEmitterMapping {}

export type EmitterMapping = ChatRoomEmitterMapping & MessageEmitterMapping;

const ChatRoomListenerSchema = {
  "chatroom-create": ChatRoomDTOSchema,
  "chatroom-update": ChatRoomDTOSchema,
  "chatroom-getall": z.array(ChatRoomDTOSchema),
};

const MessageListenerSchema = {
  "message-create": MessageDTOSchema,
  "message-update": MessageDTOSchema,
  "message-chatroom": z.record(z.string(), z.array(MessageDTOSchema)),
};
const ChatUserListenerSchema = {
  "chatuser-create": ChatUserDTOSchema,
  "chatuser-update": ChatUserDTOSchema,
  "chatuser-getall": z.array(ChatUserDTOSchema),
};

const ListenerSchema = {
  ...ChatRoomListenerSchema,
  ...MessageListenerSchema,
  ...ChatUserListenerSchema,
};

export type ListenerSchema = typeof ListenerSchema;
export type ChatRoomListenerSchema = typeof ChatRoomListenerSchema;
export type MessageListenerSchema = typeof MessageListenerSchema;
export type ChatUserListenerSchema = typeof ChatUserListenerSchema;
export { ListenerSchema, ChatRoomListenerSchema, MessageListenerSchema, ChatUserListenerSchema };
