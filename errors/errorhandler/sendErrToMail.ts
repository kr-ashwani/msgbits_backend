import mailService from "../../service/mail/mailService";

async function sendMailToAdminIfCritical(err: Error) {
  err.stack = getSimplifiedStack(err);
  mailService.addErrorMailToQueue(err);
}

function getSimplifiedStack(err: Error) {
  if (err.stack) {
    const stackArr = err.stack.split("\n");
    const newStackArr = [];
    for (let i = 0; i <= 3 && i < stackArr.length; i++) newStackArr.push(stackArr[i]);
    const newStack = newStackArr.join("\n");
    const simplifiedStack = `${newStack}\n +${err.stack.length - newStack.length}more.`;
    return simplifiedStack;
  }
  return "";
}

export default sendMailToAdminIfCritical;
