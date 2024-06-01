import { Schema, model, Document, InferSchemaType, HydratedDocument, Model } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser {
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}
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
