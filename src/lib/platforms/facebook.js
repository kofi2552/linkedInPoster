import { BasePlatform } from "./base.js";

export class FacebookPlatform extends BasePlatform {
    constructor() {
        super("facebook");
        this.clientId = process.env.FACEBOOK_CLIENT_ID;
        this.clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
        this.redirectUri = process.env.FACEBOOK_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/facebook/callback`;
    }

    async getAuthUrl(userId) {
        const scope = "pages_manage_posts,pages_read_engagement,pages_show_list,public_profile";
        const state = Buffer.from(JSON.stringify({ userId })).toString("base64");

        const authUrl = new URL("https://www.facebook.com/v18.0/dialog/oauth");
        authUrl.searchParams.append("client_id", this.clientId);
        authUrl.searchParams.append("redirect_uri", this.redirectUri);
        authUrl.searchParams.append("state", state);
        authUrl.searchParams.append("scope", scope);

        return authUrl.toString();
    }

    async handleCallback(code, state) {
        // 1. Exchange code for user access token
        const tokenResponse = await fetch("https://graph.facebook.com/v18.0/oauth/access_token", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                redirect_uri: this.redirectUri,
                code,
            }),
        });
        // Wait, Facebook Graph API token exchange is typically a GET request with query params
        const tokenUrl = new URL("https://graph.facebook.com/v18.0/oauth/access_token");
        tokenUrl.searchParams.append("client_id", this.clientId);
        tokenUrl.searchParams.append("client_secret", this.clientSecret);
        tokenUrl.searchParams.append("redirect_uri", this.redirectUri);
        tokenUrl.searchParams.append("code", code);

        const res = await fetch(tokenUrl.toString());
        if (!res.ok) throw new Error("Failed to exchange code for Facebook token");
        const tokenData = await res.json();

        // 2. Get user info
        const meRes = await fetch(`https://graph.facebook.com/me?access_token=${tokenData.access_token}&fields=id,name,picture`);
        if (!meRes.ok) throw new Error("Failed to fetch Facebook user profile");
        const meData = await meRes.json();

        // Note: To post to a Page, we often need a Page Access Token.
        // For simplicity in this initial implementation, we'll store the User Token.
        // Real implementation would list pages and let user select one.

        return {
            accessToken: tokenData.access_token,
            refreshToken: null, // Facebook uses long-lived tokens instead
            expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
            platformUserId: meData.id,
            profileName: meData.name,
            profilePictureUrl: meData.picture?.data?.url,
        };
    }

    async publishPost(accessToken, content, platformUserId, imageBase64 = null) {
        try {
            // For now, we assume posting to the user's feed or the first page they managed (simple version)
            // Implementation for posting to Page:
            // 1. Get Page Access Token
            // 2. POST to /{page-id}/feed

            let endpoint = `https://graph.facebook.com/v18.0/${platformUserId}/feed`;
            let body = { message: content, access_token: accessToken };

            if (imageBase64) {
                endpoint = `https://graph.facebook.com/v18.0/${platformUserId}/photos`;
                // FB accepts source as a URL or multipart/form-data. For base64, we might need a different approach or intermediate upload.
                // For simplicity, we'll just handle text for now or implement multipart.
            }

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || "Facebook post failed");

            return { success: true, postId: data.id };
        } catch (error) {
            console.error("Facebook publish error:", error);
            return { success: false, error: error.message };
        }
    }
}
