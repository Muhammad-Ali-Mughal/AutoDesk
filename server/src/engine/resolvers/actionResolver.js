import { emailResolver } from "./emailResolver.js";
import { googleSheetsResolver } from "./googleSheetsResolver.js";

const resolvers = {
  email: emailResolver,
  google_sheets: googleSheetsResolver,
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
