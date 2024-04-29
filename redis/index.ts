import type { Queue, Worker } from "bullmq";
import MailQueue from "./queues/MailQueue";
import MailWorker from "./workers/MailWorker";
import Mail from "../utilityClasses/mail/Mail";

class RedisPubSub {
  private static redispubsub: RedisPubSub;

  // Mail Queue and Worker
  mailQueue: Queue<Mail, Mail>;
  private mailWorker: Worker<Mail, Mail>;

  private constructor() {
    //Initialize Mail Queue and Worker
    this.mailQueue = new MailQueue<Mail, Mail>().getQueue();
    this.mailWorker = new MailWorker<Mail, Mail>().getWorker();
  }

  public static getInstance() {
    if (this.redispubsub) return this.redispubsub;
    else return new RedisPubSub();
  }
}

const redisPubSub = RedisPubSub.getInstance();

export default redisPubSub;
