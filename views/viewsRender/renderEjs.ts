import ejs from "ejs";
import path from "path";
import { renderEJSopts, ViewType } from "./renderEjsTypes";

class RenderEJS {
  private viewLocation = new Map<ViewType, string>();

  constructor() {
    this.viewLocation.set("ERROR_MAIL", path.join(__dirname, "../views/mail/errorTemplate.ejs"));
    this.viewLocation.set("OTP_MAIL", path.join(__dirname, "../views/otp/otpTemplate.ejs"));
    this.viewLocation.set(
      "PASSWORD_RESET_MAIL",
      path.join(__dirname, "../views/mail/forgotPassword.ejs")
    );
  }
  /**
   * Convert dynamic HTML(ejs) to string format
   * @param object of type { mail:Mail, err:Error,  stack:string}
   * @returns string representing HTML of mail body
   */
  public async renderEJS(viewOpts: renderEJSopts) {
    const ejsPath = this.viewLocation.get(viewOpts.type);
    try {
      if (!ejsPath) throw new Error("ejs Path is undefined");
      const htmlBody = await ejs.renderFile(ejsPath, viewOpts);
      return htmlBody;
    } catch (err: unknown) {
      if (err instanceof Error) console.error("failed to render Ejs because ", err.message);
      return `HTML did not render`;
    }
  }
}

const renderEJS = new RenderEJS();
export default renderEJS;
