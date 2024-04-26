import path from "path";
import Mail from "../../classes/mail/Mail";
import { MailQueueName } from "../queues/MailQueue";
import BaseWorker from "./BaseWorker";

class MailWorker<DataType, ResultType> extends BaseWorker<DataType, ResultType> {
  private static workerHref = path.join(__dirname, "./workerFiles/MailWorker.js");
  constructor() {
    super(MailWorker.name, MailQueueName, MailWorker.workerHref);
  }
}

const obj = new MailWorker<Mail, Mail>();

//console.log(obj);
