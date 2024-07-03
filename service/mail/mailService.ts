import config from "config";
import nodemailer from "nodemailer";
import { MailParams } from "../../utilityClasses/mail/Mail";
import logger from "../../logger";
import { userDoc } from "../../Dao/UserDAO";
import RedisPubSub from "../../redis";
import MailBuilder from "../../utilityClasses/mail/MailBuilder";
import renderEJS from "../../viewsRender/renderEjs";

class MailService {
  private static instance: MailService;
  private transporter: nodemailer.Transporter;

  private constructor() {
    this.transporter = this.createConnection();
  }
  //Instance of Mail Service
  static getInstance() {
    if (!MailService.instance) {
      MailService.instance = new MailService();
    }
    return MailService.instance;
  }
  //Mail config
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

  //create a connection
  private createConnection() {
    return (this.transporter = nodemailer.createTransport(this.mailConfig()));
  }
  //send Mail used by redis consumer
  public async sendMail(mail: MailParams) {
    try {
      await this.transporter.sendMail(mail);
      logger.info(`Mail sent successfully to ${mail.to} with subject ${mail.subject}`);
    } catch (err: any) {
      console.error("failed to send mail bacause ", err.message);
    }
  }

  async addErrorMailToQueue(err: Error) {
    const mail = new MailBuilder();

    mail
      .setFrom("Msgbits Team msgbits07@gmail.com")
      .setTo("a61ashwanikumar@gmail.com; mritunjaykr160@gmail.com;ankitkumar38203@gmail.com")
      .setSubject("Mail From Msgbits App")
      .setMailSalutation("Hi Admin,")
      .setMailSignature(`Thanks & Regards,\nMsgbits Team`);

    const html = await renderEJS.renderEJS({
      type: "ERROR_MAIL",
      mail,
      err,
      stack: err.stack || "Stack is empty",
    });
    mail.setHtml(html);
    // add mail to redis mail queue
    RedisPubSub.getInstance().mailQueue.add("send error mail to Admin", mail);
  }
  async addOTPmailToQueue(user: userDoc) {
    const mail = new MailBuilder();

    mail
      .setFrom("Msgbits Team msgbits07@gmail.com")
      .setTo(user.email)
      .setSubject("Mail From Msgbits App");

    const html = await renderEJS.renderEJS({
      type: "OTP_MAIL",
      name: user.name,
      otp: user.authCode,
    });
    mail.setHtml(html);
    // add mail to redis mail queue
    RedisPubSub.getInstance().mailQueue.add("send otp to user", mail);
  }

  async addPasswordResetMailToQueue(user: userDoc) {
    const mail = new MailBuilder();

    mail
      .setFrom("Msgbits Team msgbits07@gmail.com")
      .setTo(user.email)
      .setSubject("Mail From Msgbits App");

    const html = await renderEJS.renderEJS({
      type: "PASSWORD_RESET_MAIL",
      name: user.name,
      passwordResetLink: `${config.get<string>("CLIENT_URL")}/resetpassword?email=${
        user.email
      }&code=${user.authCode}`,
    });
    mail.setHtml(html);
    // add mail to redis mail queue
    RedisPubSub.getInstance().mailQueue.add("send otp to user", mail);
  }
}

const mailService = MailService.getInstance();
export default mailService;
