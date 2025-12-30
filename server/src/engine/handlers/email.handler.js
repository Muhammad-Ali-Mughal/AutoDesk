import { sendEmail } from "../../services/mailer.js";
import { resolveTemplate } from "../resolvers/resolveTemplate.js";

export default async function emailHandler(action, context) {
  // console.log("EMAIL CONTEXT:", JSON.stringify(context, null, 2));
  const resolved = {
    to: resolveTemplate(action.config.to, context),
    subject: resolveTemplate(action.config.subject, context),
    body: resolveTemplate(action.config.body, context),
  };

  const result = await sendEmail(resolved);
  return result;
}
