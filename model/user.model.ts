import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import { ArrayElement } from "../types";

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
  authCode: number;
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
      type: Number,
      required: [true, "Auth code is required"],
      min: 100000,
      max: 999999,
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
  if (!this.isModified("password")) return next();

  const hashPswd = await bcrypt.hash(this.password, 10);
  this.password = hashPswd;

  return next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password).catch((e) => false);
};

const UserModel = model<IUser>("User", userSchema);
export default UserModel;
