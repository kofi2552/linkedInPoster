import { SocialAccount } from "@/lib/models.js";
import { getPlatform } from "@/lib/platforms/index.js";

export async function GET(request, { params }) {
    try {
        const { platform: platformName } = await params;
        const { searchParams } = new URL(request.url);
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (!code || !state) {
            return Response.json({ error: "Missing code or state" }, { status: 400 });
        }

        // Decode state to get userId
        const { userId } = JSON.parse(Buffer.from(state, "base64").toString());

        const platform = getPlatform(platformName);
        const tokenData = await platform.handleCallback(code, state);

        // Save to SocialAccount
        await SocialAccount.upsert({
            userId,
            platform: platformName,
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
            `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?connected=true&platform=${platformName}`
        );
    } catch (error) {
        console.error("Callback error:", error);
        return Response.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=${encodeURIComponent(error.message)}`
        );
    }
}
