import { number, object, string, coerce } from "zod";

export interface OTPSchema {
  email: string;
  otp: number;
}
// validates req.body for OTP
export const createOTPSchema = object({
  body: object({
    otp: coerce
      .number({
        required_error: "OTP is required",
        invalid_type_error: "OTP is not valid ",
      })
      .min(100000)
      .max(999999),
    email: string({
      required_error: "Email is required",
    }).email("Not a valid email"),
  }),
});
