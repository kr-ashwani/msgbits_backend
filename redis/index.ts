import type { Queue, Worker } from "bullmq";
import MailQueue from "./queues/MailQueue";
import MailWorker from "./workers/MailWorker";
import Mail from "../utils/utilityClasses/mail/Mail";

/**
 * Centralised class for initializing all queue and Worker
 */
class RedisPubSub {
  private static redispubsub: RedisPubSub;

  // Mail Queue and Worker
  mailQueue: Queue<Mail, Mail>;
  errMailQueue: Queue<Mail, Mail>;
  private mailWorker: Worker<Mail, Mail>;

  private constructor() {
    //Initialize Mail Queue and Worker
    let queue = new MailQueue<Mail, Mail>();
    this.mailQueue = queue.getQueue();
    this.errMailQueue = queue.getErrorQueue();
    this.mailWorker = new MailWorker<Mail, Mail>().getWorker();
  }

  public static getInstance() {
    if (!this.redispubsub) this.redispubsub = new RedisPubSub();
    return this.redispubsub;
  }
}

export default RedisPubSub;
