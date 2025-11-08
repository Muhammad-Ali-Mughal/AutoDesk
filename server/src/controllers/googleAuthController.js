import { google } from "googleapis";
import GoogleAccount from "../models/GoogleAccount.model.js";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Step 1: Redirect user to Google login
export const googleAuth = async (req, res) => {
  try {
    const scopes = [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/spreadsheets",
      "email",
      "profile",
    ];

    // 🔹 Detect if user has already connected Google before
    const existing = await GoogleAccount.findOne({ userId: req.user._id });
    const prompt = existing ? "none" : "consent";

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt,
      scope: scopes,
      state: JSON.stringify({ userId: req.user._id }),
    });

    res.redirect(url);
  } catch (err) {
    console.error("Google Auth error:", err);
    res.status(500).send("Failed to start Google authentication.");
  }
};

// Step 2: Handle Google redirect (callback)
export const googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const { userId } = JSON.parse(state);

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    console.log("✅ Google user connected:", data.email);

    await GoogleAccount.findOneAndUpdate(
      { userId, googleId: data.id },
      {
        userId,
        googleId: data.id,
        email: data.email,
        name: data.name,
        picture: data.picture,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scopes: tokens.scope ? tokens.scope.split(" ") : [],
      },
      { upsert: true, new: true }
    );

    // ✅ Popup callback
    res.send(`
      <script>
        window.opener.postMessage({ type: "GOOGLE_AUTH_SUCCESS" }, "*");
        window.close();
      </script>
    `);
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    res.redirect(`${process.env.CLIENT_URL}/google-success?connected=false`);
  }
};

// Step 3: Check if user is connected to Google
export const checkGoogleStatus = async (req, res) => {
  try {
    const { user } = req;
    const accounts = await GoogleAccount.find({ userId: user._id });
    if (!accounts || accounts.length === 0) {
      return res.json({ connected: false, accounts: [] });
    }

    const now = new Date();
    const validAccounts = accounts.filter(
      (acc) => acc.expiryDate && new Date(acc.expiryDate) > now
    );

    res.json({
      connected: validAccounts.length > 0,
      accounts: validAccounts.map((acc) => ({
        googleId: acc.googleId,
        email: acc.email,
        name: acc.name,
        picture: acc.picture,
        expiresAt: acc.expiryDate,
        scopes: acc.scopes,
      })),
    });
  } catch (err) {
    console.error("Check Google status error:", err);
    res
      .status(500)
      .json({ connected: false, message: "Failed to check status" });
  }
};
