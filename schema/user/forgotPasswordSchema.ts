import { object, string, TypeOf } from "zod";

export const forgotPasswordSchema = object({
  email: string({
    required_error: "Email is required",
  }).email("Not a valid email"),
});

export type IforgotPassword = TypeOf<typeof forgotPasswordSchema>;
