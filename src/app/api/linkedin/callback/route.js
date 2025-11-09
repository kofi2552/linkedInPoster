import { User } from "@/lib/models.js";

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI =
  process.env.LINKEDIN_REDIRECT_URI ||
  `${process.env.NEXT_PUBLIC_APP_URL}/api/linkedin/callback`;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      return Response.json({ error: "Missing code or state" }, { status: 400 });
    }

    // Decode state to get userId
    const { userId } = JSON.parse(Buffer.from(state, "base64").toString());

    //console.log("LinkedIn callback received for userId:", userId);

    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://www.linkedin.com/oauth/v2/accessToken",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          client_id: LINKEDIN_CLIENT_ID,
          client_secret: LINKEDIN_CLIENT_SECRET,
          redirect_uri: LINKEDIN_REDIRECT_URI,
        }).toString(),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const tokenData = await tokenResponse.json();

    //console.log("LinkedIn token data received:", tokenData);

    // Update user with LinkedIn tokens
    const user = await User.findByPk(userId);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    await user.update({
      linkedinAccessToken: tokenData.access_token,
      linkedinTokenExpiresAt: new Date(
        Date.now() + tokenData.expires_in * 1000
      ),
    });

    // Redirect to dashboard
    return Response.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?connected=true`
    );
  } catch (error) {
    console.error("LinkedIn callback error:", error);
    return Response.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=${error.message}`
    );
  }
}
