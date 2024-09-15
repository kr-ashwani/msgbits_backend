import { FilterQuery } from "mongoose";
import { chatRoomDAO } from "../../../../Dao/ChatRoomDAO";
import { IChatRoom } from "../../../../model/chatRoom.model";
import { GenericRowMapper } from "../../../../Dao/RowMapper/GenericRowMapper";
import logger from "../../../../logger";
import DecoratorPermissionError from "../../../../errors/decoratorError.ts/DecoratorPermission";

// to check wheteher a user is admin or memeber
async function isMemeberOrAdmin(type: "admin" | "member", chatRoomId: string, userId: string) {
  let success: boolean = false;

  const filter: FilterQuery<IChatRoom> = {
    chatRoomId,
    members: userId,
  };
  if (type === "admin") filter.admins = userId;

  await chatRoomDAO.find(
    filter,
    new GenericRowMapper<{ chatRoomId: string }>((result) => {
      success = true;
    }),
    null,
    { chatRoomId: 1, _id: 0 }
  );

  return success;
}

export function isMember() {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ): TypedPropertyDescriptor<any> | void {
    const originalMethod = descriptor.value;
    descriptor.value = async function (this: any, ...args: any[]) {
      const { chatRoomId, userId } = args[0];
      const success = await isMemeberOrAdmin("member", chatRoomId, userId);
      logInfo({
        chatRoomId: String(chatRoomId),
        userId: String(userId),
        type: "member",
        success,
        className: String(this?.constructor?.name),
        method: String(originalMethod?.name),
      });

      return originalMethod.apply(this, args);
    };
  };
}

export function isAdmin() {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ): TypedPropertyDescriptor<any> | void {
    const originalMethod = descriptor.value;
    descriptor.value = async function (this: any, ...args: any[]) {
      const { chatRoomId, userId } = args[0];
      const success = await isMemeberOrAdmin("admin", chatRoomId, userId);
      logInfo({
        chatRoomId: String(chatRoomId),
        userId: String(userId),
        type: "admin",
        success,
        className: String(this?.constructor?.name),
        method: String(originalMethod?.name),
      });

      return originalMethod.apply(this, args);
    };
  };
}

function logInfo({
  type,
  method,
  chatRoomId,
  userId,
  success,
  className,
}: {
  chatRoomId: string;
  userId: string;
  success: boolean;
  type: "admin" | "member";
  className: string;
  method: string;
}) {
  const msg = `${className}'s ${method} access ${
    success ? "granted" : "denied"
  } for ${type} with ID ${userId} to chat room ${chatRoomId}.`;
  if (success) logger.info(msg);
  else throw new DecoratorPermissionError(msg);
}
