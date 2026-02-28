export function buildInitialContext({ webhookPayload, workflow }) {
  const payload =
    webhookPayload && typeof webhookPayload === "object" ? webhookPayload : {};

  // Manual trigger may pass a pre-wrapped object { webhook, _source, ... }.
  const hasWrappedWebhook =
    payload.webhook &&
    typeof payload.webhook === "object" &&
    ("_source" in payload ||
      "_workflowId" in payload ||
      "_triggeredBy" in payload ||
      "_organizationId" in payload);

  const normalizedWebhook = hasWrappedWebhook ? payload.webhook : payload;

  return {
    ...payload,
    ...(normalizedWebhook && typeof normalizedWebhook === "object"
      ? normalizedWebhook
      : {}),
    webhook: normalizedWebhook,
    // Backward compatibility for existing templates like {{context.payload.user.name}}
    context: {
      payload: normalizedWebhook,
    },
    steps: {},
    meta: {
      workflowId: workflow._id.toString(),
      userId: workflow.userId.toString(),
      startedAt: new Date(),
    },
  };
}
