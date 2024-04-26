import sendErrToLogger from "./sendErrToLogger";

/**
 * @param err
 * This is the centralised Error Handler.
 * All Error must pass through this centralised handler
 */
async function handleError(err: Error): Promise<void> {
  //await sendMailToAdminIfCritical();
  sendErrToLogger(err);
  //await sendEventsToSentry();
}

export default handleError;
