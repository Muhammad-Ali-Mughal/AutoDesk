import { emailResolver } from "./emailResolver.js";

const resolvers = {
  email: emailResolver,
  // slack: slackResolver,
  // sms: smsResolver,
  // etc...
};

export async function resolveAction(action, node, workflowId) {
  if (!action) return null;

  const resolver = resolvers[action.type];
  if (resolver) {
    return await resolver(action, node, workflowId);
  }

  return action;
}
