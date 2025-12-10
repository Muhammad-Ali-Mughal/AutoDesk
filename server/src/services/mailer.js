import nodemailer from "nodemailer";

export const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function sendEmail({ to, subject, body }) {
  try {
    const info = await mailer.sendMail({
      from: `"AutoDesk" <${process.env.GMAIL_USER}>`,
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
