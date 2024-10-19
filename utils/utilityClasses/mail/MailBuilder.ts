import Mail, { MailParams } from "./Mail";

class MailBuilder extends Mail {
  constructor(mail?: MailParams) {
    super(mail);
  }
  public setFrom(from: string) {
    super.setFrom(from);
    return this;
  }
  public setTo(to: string | string[]) {
    super.setTo(to);
    return this;
  }
  public setCc(cc: string | string[]) {
    super.setCc(cc);
    return this;
  }
  public setBcc(bcc: string | string[]) {
    super.setBcc(bcc);
    return this;
  }
  public setSubject(subject: string) {
    super.setSubject(subject);
    return this;
  }
  public setMailSalutation(mailSalutation: string) {
    super.setMailSalutation(mailSalutation);
    return this;
  }
  public setBody(body: string) {
    super.setBody(body);
    return this;
  }
  public setMailSignature(mailSignature: string) {
    super.setMailSignature(mailSignature);
    return this;
  }
  public setMainBody(mainBody: string) {
    super.setMainBody(mainBody);
    return this;
  }
  public setHtml(html: string) {
    super.setHtml(html);
    return this;
  }
}

export default MailBuilder;
