import { z } from "zod";

// validates req.body for OTP
export const createOTPSchema = z.object({
  otp: z.coerce
    .number({
      required_error: "OTP is required",
      invalid_type_error: "OTP is not valid ",
    })
    .min(100000)
    .max(999999),
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Not a valid email"),
});

export type OTPSchema = z.infer<typeof createOTPSchema>;
