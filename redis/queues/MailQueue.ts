import BaseQueue from "./BaseQueue";

class MailQueue<DataType, ResultType> extends BaseQueue<DataType, ResultType> {
  constructor() {
    super(MailQueue.name);
  }

  add() {}
}

const MailQueueName = MailQueue.name;
export { MailQueueName };
export default MailQueue;
