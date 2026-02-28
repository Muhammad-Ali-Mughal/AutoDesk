import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure env is loaded even if this module is imported outside src/index.js
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function createMailer() {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_PASS?.trim();

  if (!user || !pass) {
    const missing = [];
    if (!user) missing.push("GMAIL_USER");
    if (!pass) missing.push("GMAIL_PASS");
    throw new Error(
      `Email credentials are not configured. Missing: ${missing.join(", ")}`
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendEmail({ to, subject, body }) {
  try {
    const mailer = createMailer();
    const fromUser = process.env.GMAIL_USER?.trim();

    const info = await mailer.sendMail({
      from: `"AutoDesk" <${fromUser}>`,
      to,
      subject,
      text: body,
      html: `<p>${body}</p>`,
    });

    console.log("📧 Email sent:", to, info.messageId);
    return { success: true, id: info.messageId };
  } catch (err) {
    console.error("❌ Email sending failed:", err);
    return { success: false, error: err.message };
  }
}
