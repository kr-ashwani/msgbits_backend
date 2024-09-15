import { z } from "zod";
import { ChatRoomDTO, ChatRoomDTOSchema } from "../../schema/chat/ChatRoomDTOSchema";
import { ChatUserDTO, ChatUserDTOSchema } from "../../schema/chat/ChatUserDTOSchema";
import { MessageDTO, MessageDTOSchema } from "../../schema/chat/MessageDTOSchema";
import { SyncUpdateInputSchema } from "../../schema/chat/SyncUpdateInputSchema";
import {
  MessageStatusInputSchema,
  MessageStatusOutput,
} from "../../schema/chat/MessageStatusInputSchema";
import { ChatAddNewMember, ChatAddNewMemberSchema } from "../../schema/chat/ChatAddNewMemberSchema";
import {
  ChatRoomAndMember,
  ChatRoomAndMemberSchema,
} from "../../schema/chat/ChatRoomAndMemberSchema";

export interface ChatRoomEmitterMapping {
  "chatroom-create": ChatRoomDTO;
  "chatroom-addNewMembers": ChatAddNewMember;
  "chatroom-leave": ChatRoomAndMember;
  "chatroom-removeUser": ChatRoomAndMember;
  "chatroom-makeAdmin": ChatRoomAndMember;
  "chatroom-removeAdmin": ChatRoomAndMember;
}

export interface MessageEmitterMapping {
  "message-create": MessageDTO;
  "message-delivered": MessageStatusOutput;
  "message-seen": MessageStatusOutput;
  "message-sent": string;
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
  "chatroom-addNewMembers": ChatAddNewMemberSchema,
  "chatroom-leave": ChatRoomAndMemberSchema,
  "chatroom-removeUser": ChatRoomAndMemberSchema,
  "chatroom-makeAdmin": ChatRoomAndMemberSchema,
  "chatroom-removeAdmin": ChatRoomAndMemberSchema,
};

const MessageListenerSchema = {
  "message-create": MessageDTOSchema,
  "message-update": MessageDTOSchema,
  "message-chatroom": z.record(z.string(), z.array(MessageDTOSchema)),
  "message-delivered": MessageStatusInputSchema,
  "message-seen": MessageStatusInputSchema,
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

interface SuccessAckMessage {
  success: true;
}
interface FailureAckMessage {
  success: false;
  error: string;
}
export type AckMessage = SuccessAckMessage | FailureAckMessage;
