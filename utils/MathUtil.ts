import { AppError } from "../errors/AppError";
import crypto from "crypto";
class MathUtil {
  /**
   * Generates a secure random number with the specified number of digits.
   * @param {number} digitCount - The number of digits for the random number.
   * @returns {number} - A secure random number with the specified number of digits.
   */
  static generateSecureRandomNumber(digitCount: number) {
    if (digitCount <= 0) {
      throw new AppError("Digit count must be a positive integer.", "Math Error");
    }
    if (digitCount === 1) {
      throw new AppError("Digit count must be greater than 1.", "Math Error");
    }

    // Calculate the minimum and maximum value for the given digit count
    const min = Math.pow(10, digitCount - 1);
    const max = Math.pow(10, digitCount) - 1;

    // Generate a secure random integer within the range [min, max]
    const range = max - min + 1;
    const bytes = Math.ceil(Math.log2(range) / 8);
    const buffer = crypto.randomBytes(bytes);
    let randomNumber = BigInt("0x" + buffer.toString("hex")) % BigInt(range);

    // Convert BigInt to a number and add min to get the desired range
    randomNumber += BigInt(min);
    return Number(randomNumber);
  }
}

export { MathUtil };
