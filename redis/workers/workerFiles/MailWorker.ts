import { SandboxedJob } from "bullmq";
import Mail from "../../../classes/mail/Mail";

export default async (job: SandboxedJob<Mail, Mail>) => {
  // Do something with job
  console.log(job.id, job.data);
};
