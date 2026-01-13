import { User, SocialAccount } from "@/lib/models.js";
import { getPlatform } from "@/lib/platforms/index.js";

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

    const platform = getPlatform("linkedin");
    const tokenData = await platform.handleCallback(code, state);

    // Update user with LinkedIn tokens (keep legacy for compatibility)
    const user = await User.findByPk(userId);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    await user.update({
      linkedinAccessToken: tokenData.accessToken,
      linkedinProfileId: tokenData.platformUserId,
      linkedinTokenExpiresAt: tokenData.expiresAt,
    });

    // Save to SocialAccount (new clean architecture)
    await SocialAccount.upsert({
      userId,
      platform: "linkedin",
      platformUserId: tokenData.platformUserId,
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      tokenExpiresAt: tokenData.expiresAt,
      profileName: tokenData.profileName,
      profilePictureUrl: tokenData.profilePictureUrl,
      isActive: true,
    });

    // Redirect to dashboard
    return Response.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?connected=true`
    );
  } catch (error) {
    console.error("LinkedIn callback error:", error);
    return Response.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=${encodeURIComponent(error.message)}`
    );
  }
}
