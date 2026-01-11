import { google } from "googleapis";
import GoogleAccount from "../models/GoogleAccount.model.js";

const getOAuthClient = () => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } =
    process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    throw new Error("Google OAuth env vars are not configured");
  }

  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
};

// Step 1: Redirect user to Google login
export const googleAuth = async (req, res) => {
  try {
    const oauth2Client = getOAuthClient();
    const scopes = [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/spreadsheets",
      "email",
      "profile",
    ];

    // Force an interactive screen to avoid instant close on stale sessions.
    const existing = await GoogleAccount.findOne({ userId: req.user._id });
    const prompt = existing?.refreshToken ? "select_account" : "consent";

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt,
      include_granted_scopes: true,
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
    if (!code || !state) {
      return res.status(400).send(`
        <html>
          <body style="font-family: sans-serif; padding: 24px;">
            <h3>Google authorization failed</h3>
            <p>Missing authorization code. Please try again.</p>
            <button onclick="window.close()">Close</button>
            <script>
              if (window.opener) {
                window.opener.postMessage(
                  { type: "GOOGLE_AUTH_ERROR", message: "Missing authorization code" },
                  "*"
                );
              }
            </script>
          </body>
        </html>
      `);
    }

    const { userId } = JSON.parse(state);
    const oauth2Client = getOAuthClient();

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
    res.status(500).send(`
      <html>
        <body style="font-family: sans-serif; padding: 24px;">
          <h3>Google authorization failed</h3>
          <p>Please try connecting again.</p>
          <button onclick="window.close()">Close</button>
          <script>
            if (window.opener) {
              window.opener.postMessage(
                { type: "GOOGLE_AUTH_ERROR", message: "OAuth callback error" },
                "*"
              );
            }
          </script>
        </body>
      </html>
    `);
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
