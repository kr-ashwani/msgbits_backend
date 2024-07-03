import { Schema, Types, model } from "mongoose";

export type IRole = {
  role: "admin" | "user";
  userId: Types.ObjectId;
};
// Role Schema
const roleSchema = new Schema<IRole>(
  {
    role: {
      type: String,
      required: [true, "role type is missing"],
      default: "user",
    },
    userId: { type: Schema.Types.ObjectId, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

const RoleModel = model<IRole>("Role", roleSchema);
export default RoleModel;
