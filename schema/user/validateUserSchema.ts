import { object, string, TypeOf } from "zod";

// validates req.body for new user
export const validateUserSchema = object({
  password: string({
    required_error: "Password is required",
  }).min(6, "Password too short - should be of 6 characters minimum"),

  email: string({
    required_error: "Email is required",
  }).email("Not a valid email"),
});

export type validateUserSchema = TypeOf<typeof validateUserSchema>;
