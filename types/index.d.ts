import { ResponseUserSchema } from "../responseSchema";

declare global {
  namespace Express {
    // Inject additional properties on express.Request
    interface Request {
      /**
       * if user is not authenticated then authUser will be null.
       * only if user is authenticated then authUser will contain user info
       */
      authUser: ResponseUserSchema | null;
    }
  }
}

export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
