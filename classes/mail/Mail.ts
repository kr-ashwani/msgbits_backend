interface MailParams {
  from: string;
  to: string | string[];
  cc: string | string[];
  bcc: string | string[];
  subject: string;
  mailSalutation: string;
  body: string;
  mailSignature: string;
  mainBody: string;
}

class Mail {
  private from: string;
  private to: string | string[];
  private cc: string | string[];
  private bcc: string | string[];
  private subject: string;
  private mailSalutation: string;
  private body: string;
  private mailSignature: string;
  private mainBody: string;

  constructor(mail?: MailParams) {
    this.from = mail?.from || "";
    this.to = mail?.to || "";
    this.cc = mail?.cc || "";
    this.bcc = mail?.bcc || "";
    this.subject = mail?.subject || "";
    this.mailSalutation = mail?.mailSalutation || "";
    this.body = mail?.body || "";
    this.mailSignature = mail?.mailSignature || "";
    this.mainBody = mail?.mainBody || "";
  }
  public setFrom(from: string) {
    this.from = from;
  }
  public setTo(to: string | string[]) {
    this.to = to;
  }
  public setCc(cc: string | string[]) {
    this.cc = cc;
  }
  public setBcc(bcc: string | string[]) {
    this.bcc = bcc;
  }
  public setSubject(subject: string) {
    this.subject = subject;
  }
  public setMailSalutation(mailSalutation: string) {
    this.mailSalutation = mailSalutation;
  }
  public setBody(Body: string) {
    this.body = this.body;
  }
  public setMailSignature(mailSignature: string) {
    this.mailSignature = mailSignature;
  }
  public setMainBody(mainBody: string) {
    this.mainBody = mainBody;
  }

  public getFrom() {
    return this.from;
  }
  public getTo() {
    return this.to;
  }
  public getCc() {
    return this.cc;
  }
  public getBcc() {
    return this.bcc;
  }
  public getSubject() {
    return this.subject;
  }
  public getMailSalutation() {
    return this.mailSalutation;
  }
  public getBody() {
    return this.body;
  }
  public getMailSignature() {
    return this.mailSignature;
  }
  public getMainBody() {
    return this.mainBody;
  }
}

export default Mail;
