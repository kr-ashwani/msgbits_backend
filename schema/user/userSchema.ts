import { z } from "zod";

export interface UserInput {
  email: string;
  name: string;
  password: string;
  profilePicture: string;
}

// validates req.body for new user
export const createUserSchema = z.object({
  name: z.string({
    required_error: "Name is required",
  }),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(6, "Password too short - should be of 6 characters minimum"),
  confirmPassword: z.string({
    required_error: "confirmPassword is required",
  }),
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Not a valid email"),
  profilePicture: z.string({
    required_error: "profile picture is required",
  }),
});

createUserSchema.refine((data) => data.password === data.confirmPassword, {
  message: "confirmPassword did not match",
  path: ["confirmPassword"],
});

export type CreateUserInput = Omit<z.infer<typeof createUserSchema>, "confirmPassword">;
