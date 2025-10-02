import { google } from "googleapis";
import GoogleAccount from "../models/GoogleAccount.model.js";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Step 1: redirect user to Google login
export const googleAuth = async (req, res) => {
  try {
    const scopes = [
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/spreadsheets",
      "email",
      "profile",
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline", // ensures refresh_token is returned
      prompt: "consent", // force consent to always return refresh_token
      scope: scopes,
      state: JSON.stringify({ userId: req.user._id }), // track who is logging in
    });

    res.redirect(url);
  } catch (err) {
    console.error("Google Auth error:", err);
    res.status(500).send("Failed to start Google authentication.");
  }
};

// Step 2: handle Google redirect (callback)
export const googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const { userId } = JSON.parse(state);

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch user profile info
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    console.log(data.id);

    // Save or update in DB
    await GoogleAccount.findOneAndUpdate(
      { userId, googleId: data.id }, // allow multiple Google accounts per user
      {
        userId,
        googleId: data.id,
        email: data.email,
        name: data.name,
        picture: data.picture,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scopes: tokens.scope ? tokens.scope.split(" ") : [], // save granted scopes
      },
      { upsert: true, new: true }
    );

    // ✅ If using popup, just close it:
    res.send(`
              <script>
                window.opener.postMessage({ type: "GOOGLE_AUTH_SUCCESS" }, "*");
                window.close();
              </script>`);

    // Or redirect back to frontend if you prefer:
    // res.redirect(`${process.env.CLIENT_URL}/google-success?connected=true`);
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    res.redirect(`${process.env.CLIENT_URL}/google-success?connected=false`);
  }
};

// Utility: check if user already connected
export const checkGoogleStatus = async (req, res) => {
  try {
    const { user } = req;
    const accounts = await GoogleAccount.find({ userId: user._id });

    res.json({
      connected: accounts.length > 0,
      accounts: accounts.map((acc) => ({
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
