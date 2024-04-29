import config from "config";
import nodemailer from "nodemailer";
import Mail from "../utilityClasses/mail/Mail";
import path from "path";
import ejs from "ejs";
import logger from "../logger";

class MailService {
  private static instance: MailService;
  private transporter: nodemailer.Transporter;

  private constructor() {
    this.transporter = this.createConnection();
  }
  //INSTANCE CREATE FOR MAIL
  static getInstance() {
    if (!MailService.instance) {
      MailService.instance = new MailService();
    }
    return MailService.instance;
  }

  private mailConfig() {
    return {
      service: config.get<string>("SMTP_SERVICE"),
      port: config.get<number>("SMTP_PORT"),
      secure: config.get<boolean>("SMTP_SECURE"),
      auth: {
        user: config.get<string>("SMTP_USER"),
        pass: config.get<string>("SMTP_PASS"),
      },
    };
  }

  //CREATE A CONNECTION FOR LIVE
  createConnection() {
    return (this.transporter = nodemailer.createTransport(this.mailConfig()));
  }
  //SEND MAIL
  public async sendMail(mail: Mail) {
    try {
      await this.transporter.sendMail(mail.getMailerObj());
      logger.info(`Mail sent successfully to ${mail.getTo()} with subject ${mail.getSubject()}`);
    } catch (err: any) {
      console.error("failed to send mail bacause ", err.massage);
    }
  }

  public async renderEJS(obj: { mail: Mail; err: Error; stack: string }) {
    const errPath = path.join(__dirname, "../views/mail/errorTemplate.ejs");
    try {
      const htmlBody = await ejs.renderFile(errPath, {
        mail: obj.mail.getMailerObj(),
        err: obj.err,
        stack: obj.stack,
      });
      return htmlBody;
    } catch (err: any) {
      console.error("failed to render Ejs because ", err.massage);
      return "";
    }
  }
}

const mailService = MailService.getInstance();
export default mailService;
