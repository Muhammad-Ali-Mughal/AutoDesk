export default async function webhookHandler(action, context) {
  if (!context.webhook) {
    throw new Error("Webhook payload not found in execution context");
  }
  return {
    payload: context.webhook,
    receivedAt: new Date().toISOString(),
    source: context._source || "webhook",
  };
}
