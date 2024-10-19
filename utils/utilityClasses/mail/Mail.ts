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
  html: string;
}

class Mail {
  protected from: string;
  protected to: string | string[];
  protected cc: string | string[];
  protected bcc: string | string[];
  protected subject: string;
  protected mailSalutation: string;
  protected body: string;
  protected mailSignature: string;
  protected mainBody: string;
  protected html: string;

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
    this.html = mail?.html || "";
  }
  protected setFrom(from: string) {
    this.from = from;
  }
  protected setTo(to: string | string[]) {
    this.to = to;
  }
  protected setCc(cc: string | string[]) {
    this.cc = cc;
  }
  protected setBcc(bcc: string | string[]) {
    this.bcc = bcc;
  }
  protected setSubject(subject: string) {
    this.subject = subject;
  }
  protected setMailSalutation(mailSalutation: string) {
    this.mailSalutation = mailSalutation;
    this.mainBody = this.mailSalutation + this.mainBody;
  }
  protected setBody(body: string) {
    this.body = body;
    this.mainBody += this.body;
  }
  protected setMailSignature(mailSignature: string) {
    this.mailSignature = mailSignature;
    this.mainBody += this.mailSignature;
  }
  protected setMainBody(mainBody: string) {
    this.mainBody = mainBody;
  }
  protected setHtml(html: string) {
    this.html = html;
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

  public getMailerObj() {
    return {
      from: this.from,
      to: this.to,
      cc: this.cc,
      bcc: this.bcc,
      subject: this.subject,
      text: this.mainBody,
      mailSalutation: this.mailSalutation,
      body: this.body,
      mailSignature: this.mailSignature,
      html: this.html,
    };
  }
}

export { MailParams };
export default Mail;
