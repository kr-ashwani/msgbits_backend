import { AppError } from "../errors/AppError";

class MathUtil {
  static generateRandomNumber(start: number, end: number) {
    if (start >= end)
      throw new AppError(
        "start must be greater than end for generating random number",
        "Math Error",
        false
      );
    return Math.floor(start + Math.random() * (end - start + 1));
  }
}

export { MathUtil };
