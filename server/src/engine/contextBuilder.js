export function buildInitialContext({ webhookPayload, workflow }) {
  return {
    webhook: webhookPayload,
    steps: {},
    meta: {
      workflowId: workflow._id.toString(),
      userId: workflow.userId.toString(),
      startedAt: new Date(),
    },
  };
}
