export const sendDummyEmail = async ({ to, subject, body }) => {
  console.log("📧 Dummy Email Sent:");
  console.log("  To:     ", to);
  console.log("  Subject:", subject);
  console.log("  Body:   ", body);

  // pretend async delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    to,
    subject,
    body,
    sentAt: new Date().toISOString(),
  };
};
