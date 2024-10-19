import Mail from "../../utils/utilityClasses/mail/Mail";

interface errorTemplate {
  type: "ERROR_MAIL";
  mail: Mail;
  err: Error;
  stack: string;
}
interface otpTemplate {
  type: "OTP_MAIL";
  name: string;
  otp: number;
}

interface passwordResetTemplate {
  type: "PASSWORD_RESET_MAIL";
  name: string;
  passwordResetLink: string;
}

type renderEJSopts = errorTemplate | otpTemplate | passwordResetTemplate;
type ViewType = Pick<renderEJSopts, "type">["type"];
export { renderEJSopts, ViewType };
