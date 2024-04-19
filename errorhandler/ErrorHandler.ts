import logger from "../logger";

async function handleError(err: Error): Promise<void> {
  logger.error(err);
  //await sendMailToAdminIfCritical();
  //await sendEventsToSentry();
}

export default handleError;
