import mailService from "../../service/mail/mailService";
import { MailParams } from "../../utils/utilityClasses/mail/Mail";
import { MailQueueName } from "../queues/MailQueue";
import BaseWorker from "./BaseWorker";
import type { Job } from "bullmq";

class MailWorker<DataType, ResultType> extends BaseWorker<DataType, ResultType> {
  constructor() {
    super(MailWorker.name, MailQueueName);
  }

  protected async workerCallback(job: Job<DataType, ResultType, string>): Promise<ResultType> {
    mailService.sendMail(job.data as MailParams);
    return job.returnvalue;
  }
}

export default MailWorker;
