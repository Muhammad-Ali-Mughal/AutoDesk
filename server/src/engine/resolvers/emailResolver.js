import EmailAction from "../../models/Email.model.js";

export async function emailResolver(action, node, workflowId) {
  const emailAction = await EmailAction.findOne({
    workflowId,
    nodeId: node.id,
  });

  if (!emailAction) return action;

  return {
    ...action,
    config: {
      to: emailAction.to,
      subject: emailAction.subject,
      body: emailAction.body,
    },
  };
}
