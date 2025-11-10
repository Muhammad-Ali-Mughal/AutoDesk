import Integration from "../models/Integration.model.js";
import Webhook from "../models/Webhook.model.js";
import GoogleAuth from "../models/GoogleAccount.model.js";

// GET /api/integrations
export const getUserIntegrations = async (req, res) => {
  try {
    const userId = req.user?._id;
    const [integrations, webhooks, googleAuths] = await Promise.all([
      Integration.find({ userId }),
      Webhook.find({ userId }),
      GoogleAuth.find({ userId }),
    ]);
    res.status(200).json({
      integrations,
      webhooks,
      googleAuths,
    });
  } catch (error) {
    console.error("Error fetching integrations:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
