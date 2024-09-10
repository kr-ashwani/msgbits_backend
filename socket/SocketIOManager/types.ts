import { z } from "zod";
import { ChatRoomDTO, ChatRoomDTOSchema } from "../../schema/chat/ChatRoomDTOSchema";
import { ChatUserDTO, ChatUserDTOSchema } from "../../schema/chat/ChatUserDTOSchema";
import { MessageDTO, MessageDTOSchema } from "../../schema/chat/MessageDTOSchema";
import { SyncUpdateInputSchema } from "../../schema/chat/SyncUpdateInputSchema";

export interface ChatRoomEmitterMapping {
  "chatroom-create": ChatRoomDTO;
}

export interface MessageEmitterMapping {
  "message-create": MessageDTO;
}
export interface ChatUserEmitterMapping {
  "chatuser-getall": ChatUserDTO[];
}

export interface SyncEmitterMapping {
  "sync-update": string;
  "sync-updateChatRoom:Messages:ChatUsers": {
    chatRoom: ChatRoomDTO[];
    message: { [p in string]: MessageDTO[] };
    chatUser: ChatUserDTO[];
  };
}

export type EmitterMapping = ChatRoomEmitterMapping &
  MessageEmitterMapping &
  SyncEmitterMapping &
  ChatUserEmitterMapping;

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
};
const SyncListenerSchema = {
  "sync-updateChatRoom:Messages:ChatUsers": SyncUpdateInputSchema,
};

const ListenerSchema = {
  ...ChatRoomListenerSchema,
  ...MessageListenerSchema,
  ...ChatUserListenerSchema,
  ...SyncListenerSchema,
};

export type ListenerSchema = typeof ListenerSchema;
export type ChatRoomListenerSchema = typeof ChatRoomListenerSchema;
export type MessageListenerSchema = typeof MessageListenerSchema;
export type ChatUserListenerSchema = typeof ChatUserListenerSchema;
export { ListenerSchema, ChatRoomListenerSchema, MessageListenerSchema, ChatUserListenerSchema };
