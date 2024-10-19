import { Schema, UpdateQuery, model } from "mongoose";
import bcrypt from "bcrypt";
import { ArrayElement } from "../schema/types";
import { createModelEvents } from "./events/modelEvents";
import { ResponseUserSchema } from "../schema/responseSchema";

const authCodeType: ["VerifyAccount", "ResetPassword"] = ["VerifyAccount", "ResetPassword"];
const authType: ["GoogleOAuth", "FacebookOAuth", "GithubOAuth", "EmailPassword"] = [
  "GoogleOAuth",
  "FacebookOAuth",
  "GithubOAuth",
  "EmailPassword",
];
export type authType = ArrayElement<typeof authType>[];

export type IUser = {
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  lastOnline: Date;
  isVerified: boolean;
  profileColor: string;
  profilePicture: string;
  authType: authType;
  authCode: string;
  authCodeValidTime: number;
  authCodeType: ArrayElement<typeof authCodeType>;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
};
// User Schema
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profileColor: {
      type: String,
      required: [true, "Profile Color is required"],
    },
    profilePicture: {
      type: String,
      required: [true, "Profile Picture is required"],
    },
    authType: {
      type: [String],
      enum: authType,
      required: [true, "Auth Type is required"],
    },
    authCode: {
      type: String,
      required: [true, "Auth code is required"],
    },
    authCodeType: {
      type: String,
      required: [true, "Auth type is required"],
      enum: authCodeType,
    },
    authCodeValidTime: {
      type: Number,
      required: [true, "Auth Code valid timestamp is missing"],
    },
    lastOnline: {
      type: Date,
      required: [true, "last online is required"],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  // Check and hash password
  if (this.isModified("password")) this.password = await hashString(this.password);

  // Check and hash authCode
  if (this.isModified("authCode")) this.authCode = await hashString(this.authCode);

  return next();
});

userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as UpdateQuery<any>;
  if (!update) return next();

  // Check and hash password
  if (update.$set && "password" in update.$set)
    update.$set.password = await hashString(String(update.$set.password));
  else if ("password" in update) update.password = await hashString(String(update.password));

  // Check and hash authCode
  if (update.$set && "authCode" in update.$set)
    update.$set.authCode = await hashString(String(update.$set.authCode));
  else if ("authCode" in update) update.authCode = await hashString(String(update.authCode));

  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password).catch((e) => false);
};
userSchema.methods.compareAuthCode = async function (candidateAuthCode: string) {
  return await bcrypt.compare(candidateAuthCode, this.authCode).catch((e) => false);
};

// Helper function to hash a string
const hashString = async (value: string): Promise<string> => {
  return await bcrypt.hash(value, 10);
};
const UserModel = model<IUser>("User", userSchema);
export default UserModel;
export const userModelEvents = createModelEvents<ResponseUserSchema>();
