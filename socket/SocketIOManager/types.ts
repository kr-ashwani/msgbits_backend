import { z } from "zod";
import { ChatRoomDTO, ChatRoomDTOSchema } from "../../schema/chat/ChatRoomDTOSchema";
import { ChatUserDTO } from "../../schema/chat/ChatUserDTOSchema";
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
import {
  UserUpdateProfile,
  UserUpdateProfileSchema,
} from "../../schema/user/UserUpdateProfileSchema";
import {
  GroupChatProfileUpdate,
  GroupChatProfileUpdateSchema,
} from "../../schema/user/GroupChatProfileUpdate";
import {
  IWebRTCStartCall,
  IWebRTCJoinCall,
  IWebRTCEndCall,
  IWebRTCIncomingCall,
  IWebRTCDeclineCall,
  IWebRTCGetActiveParticipants,
  IWebRTCOffer,
  IWebRTCAnswer,
  IWebRTCIceCandidate,
  IWebRTCMediaStateChange,
  IWebRTCRoomFull,
  WebRTCStartCallSchema,
  WebRTCJoinCallSchema,
  WebRTCEndCallSchema,
  WebRTCIncomingCallSchema,
  WebRTCGetActiveParticipantsSchema,
  WebRTCOfferSchema,
  WebRTCAnswerSchema,
  WebRTCIceCandidateSchema,
  WebRTCMediaStateChangeSchema,
  WebRTCRoomFullSchema,
  IWebRTCCallInfo,
} from "../../schema/webRTC/WebRTCSchema";
export interface ChatRoomEmitterMapping {
  "chatroom-create": ChatRoomDTO;
  "chatroom-addNewMembers": ChatAddNewMember;
  "chatroom-leave": ChatRoomAndMember;
  "chatroom-removeUser": ChatRoomAndMember;
  "chatroom-makeAdmin": ChatRoomAndMember;
  "chatroom-removeAdmin": ChatRoomAndMember;
  "chatroom-memberTyping": ChatRoomAndMember;
  "chatroom-updateChatNameOrPic": GroupChatProfileUpdate;
}

export interface MessageEmitterMapping {
  "message-create": MessageDTO;
  "message-delivered": MessageStatusOutput;
  "message-seen": MessageStatusOutput;
  "message-sent": string;
}
export interface ChatUserEmitterMapping {
  "chatuser-new": ChatUserDTO;
  "chatuser-statusChange": {
    userId: string | string[];
    status: string;
  };
  "chatuser-updateProfile": UserUpdateProfile;
}

export interface SyncEmitterMapping {
  "sync-update": string;
  "sync-updateChatRoom:Messages:ChatUsers": {
    chatRoom: ChatRoomDTO[];
    message: { [p in string]: MessageDTO[] };
    chatUser: ChatUserDTO[];
  };
  "sync-allUserStatus": string[];
  "sync-chatRoomCallSession": IWebRTCCallInfo[];
}
export interface WebRTCEmitterMapping {
  "webrtc-startCall": IWebRTCStartCall;
  "webrtc-joinCall": IWebRTCJoinCall;
  "webrtc-endCall": IWebRTCEndCall;
  "webrtc-incomingCall": IWebRTCIncomingCall;
  "webrtc-declineCall": IWebRTCDeclineCall;
  "webrtc-getActiveParticipants": IWebRTCGetActiveParticipants;
  "webrtc-offer": IWebRTCOffer;
  "webrtc-answer": IWebRTCAnswer;
  "webrtc-iceCandidate": IWebRTCIceCandidate;
  "webrtc-mediaStateChange": IWebRTCMediaStateChange;
  "webrtc-roomFull": IWebRTCRoomFull;
  "webrtc-callSessionTerminated": string;
}

export type EmitterMapping = ChatRoomEmitterMapping &
  MessageEmitterMapping &
  SyncEmitterMapping &
  ChatUserEmitterMapping &
  WebRTCEmitterMapping;

const ChatRoomListenerSchema = {
  "chatroom-create": ChatRoomDTOSchema,
  "chatroom-addNewMembers": ChatAddNewMemberSchema,
  "chatroom-leave": ChatRoomAndMemberSchema,
  "chatroom-removeUser": ChatRoomAndMemberSchema,
  "chatroom-makeAdmin": ChatRoomAndMemberSchema,
  "chatroom-removeAdmin": ChatRoomAndMemberSchema,
  "chatroom-memberTyping": ChatRoomAndMemberSchema,
  "chatroom-updateChatNameOrPic": GroupChatProfileUpdateSchema,
};

const MessageListenerSchema = {
  "message-create": MessageDTOSchema,
  "message-update": MessageDTOSchema,
  "message-chatroom": z.record(z.string(), z.array(MessageDTOSchema)),
  "message-delivered": MessageStatusInputSchema,
  "message-seen": MessageStatusInputSchema,
};
const ChatUserListenerSchema = {
  "chatuser-updateProfile": UserUpdateProfileSchema,
};
const SyncListenerSchema = {
  "sync-updateChatRoom:Messages:ChatUsers": SyncUpdateInputSchema,
  "sync-allUserStatus": z.null(),
  heartbeat: z.string(),
};

const WebRTCListenerSchema = {
  "webrtc-startCall": WebRTCStartCallSchema,
  "webrtc-joinCall": WebRTCJoinCallSchema,
  "webrtc-endCall": WebRTCEndCallSchema,
  "webrtc-incomingCall": WebRTCIncomingCallSchema,
  "webrtc-declineCall": WebRTCEndCallSchema,
  "webrtc-getActiveParticipants": WebRTCGetActiveParticipantsSchema,
  "webrtc-offer": WebRTCOfferSchema,
  "webrtc-answer": WebRTCAnswerSchema,
  "webrtc-iceCandidate": WebRTCIceCandidateSchema,
  "webrtc-mediaStateChange": WebRTCMediaStateChangeSchema,
  "webrtc-roomFull": WebRTCRoomFullSchema,
};

const ListenerSchema = {
  ...ChatRoomListenerSchema,
  ...MessageListenerSchema,
  ...ChatUserListenerSchema,
  ...SyncListenerSchema,
  ...WebRTCListenerSchema,
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
