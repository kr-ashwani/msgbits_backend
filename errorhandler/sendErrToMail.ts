import mailService from "../service/MailService";
import MailBuilder from "../utilityClasses/mail/MailBuilder";

async function sendMailToAdminIfCritical(err: Error) {
  const mail = new MailBuilder();

  mail
    .setFrom("msgbits07@gmail.com")
    .setTo("a61ashwanikumar@gmail.com")
    .setSubject("Mail From Msgbits App")
    .setMailSalutation("Hi Admin,")
    .setMailSignature(`Thanks & Regards,\nMsgbits Team`);

  const html = await mailService.renderEJS({ mail, err, stack: getSimplifiedStack(err) });
  mail.setHtml(html);
  mailService.sendMail(mail);
}

function getSimplifiedStack(err: Error) {
  if (err.stack) {
    const originalStackLen = err.stack.length;
    const stackArr = err.stack.split("\n");
    const newStack = [stackArr[0], stackArr[1], stackArr[2]].join("\n");
    const simplifiedStack = `${newStack}\n +${originalStackLen - newStack.length}more`;
    return simplifiedStack;
  }
  return "";
}

export default sendMailToAdminIfCritical;
