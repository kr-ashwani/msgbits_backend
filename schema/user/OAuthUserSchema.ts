import { authType } from "./../../model/user.model";
import { z } from "zod";
import { createUserSchema, UserInput } from "./userSchema";

export interface OAuthUserInput extends UserInput {
  authType: authType;
  isVerified: boolean;
}

export interface OAuthUserInputAuthCodeOpt extends OAuthUserInput {
  authCode?: string;
}

export const googleOAuthSchema = z.object({
  jwt: z.string(),
});

export const facebookOAuthSchema = z.object({
  accessToken: z.string(),
});

export const githubOAuthSchema = z.object({
  code: z.string(),
});

export const OAuthUserSchema = createUserSchema
  .omit({
    password: true,
    confirmPassword: true,
  })
  .extend({
    isVerified: z.boolean({
      required_error: "isVerified is missing",
    }),
  });

export type IgoogleOAuthSchema = z.infer<typeof googleOAuthSchema>;
export type IfacebookOAuthSchema = z.infer<typeof facebookOAuthSchema>;
export type IgithubOAuthSchema = z.infer<typeof githubOAuthSchema>;
export type IOAuthUserSchema = z.infer<typeof OAuthUserSchema>;
