import { BasePlatform } from "./base.js";

export class TikTokPlatform extends BasePlatform {
    constructor() {
        super("tiktok");
        this.clientKey = process.env.TIKTOK_CLIENT_KEY;
        this.clientSecret = process.env.TIKTOK_CLIENT_SECRET;
        this.redirectUri = process.env.TIKTOK_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/tiktok/callback`;
    }

    async getAuthUrl(userId) {
        const scope = "user.info.basic,video.publish,video.upload";
        const state = Buffer.from(JSON.stringify({ userId })).toString("base64");

        const authUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
        authUrl.searchParams.append("client_key", this.clientKey);
        authUrl.searchParams.append("response_type", "code");
        authUrl.searchParams.append("scope", scope);
        authUrl.searchParams.append("redirect_uri", this.redirectUri);
        authUrl.searchParams.append("state", state);

        return authUrl.toString();
    }

    async handleCallback(code, state) {
        const tokenUrl = "https://open.tiktokapis.com/v2/oauth/token/"; // Check correct endpoint
        const params = new URLSearchParams({
            client_key: this.clientKey,
            client_secret: this.clientSecret,
            code,
            grant_type: 'authorization_code',
            redirect_uri: this.redirectUri
        });

        const res = await fetch(tokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params
        });

        if (!res.ok) throw new Error("TikTok token exchange failed");
        const tokenData = await res.json();

        // Get User Info
        const userRes = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url", {
            headers: { "Authorization": `Bearer ${tokenData.access_token}` }
        });

        const userDataWrapper = await userRes.json();
        const user = userDataWrapper.data.user;

        return {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
            platformUserId: user.open_id,
            profileName: user.display_name,
            profilePictureUrl: user.avatar_url,
        };
    }

    async publishPost(accessToken, content, platformUserId, imageBase64 = null) {
        // TikTok Direct Post API
        // Note: Direct video upload is a multi-step process.

        throw new Error("TikTok publishing not yet implemented.");
    }
}
