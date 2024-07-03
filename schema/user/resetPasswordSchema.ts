import { coerce, object, string, TypeOf } from "zod";

export const resetPasswordSchema = object({
  email: string({
    required_error: "Email is required",
  }).email("Not a valid email"),
  password: string({
    required_error: "Password is required",
  }).min(6, "Password too short - should be of 6 characters minimum"),
  confirmPassword: string({
    required_error: "confirmPassword is required",
  }),
  code: coerce
    .number({
      required_error: "OTP is required",
      invalid_type_error: "OTP is not valid ",
    })
    .min(100000)
    .max(999999),
});

resetPasswordSchema.refine((data) => data.password === data.confirmPassword, {
  message: "confirmPassword did not match",
  path: ["confirmPassword"],
});

export type IresetPassword = TypeOf<typeof resetPasswordSchema>;
