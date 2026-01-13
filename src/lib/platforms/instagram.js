import { BasePlatform } from "./base.js";

export class InstagramPlatform extends BasePlatform {
    constructor() {
        super("instagram");
        this.clientId = process.env.INSTAGRAM_CLIENT_ID;
        this.clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
        this.redirectUri = process.env.INSTAGRAM_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`;
    }

    async getAuthUrl(userId) {
        // Instagram Basic Display API or Graph API via Facebook Login
        // We'll assume Graph API ("Instagram Business") for posting capabilities.
        // This often uses the same Facebook Login flow but with specific scopes.
        const scope = "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement";
        const state = Buffer.from(JSON.stringify({ userId })).toString("base64");

        const authUrl = new URL("https://www.facebook.com/v18.0/dialog/oauth");
        authUrl.searchParams.append("client_id", this.clientId); // FB App ID
        authUrl.searchParams.append("redirect_uri", this.redirectUri);
        authUrl.searchParams.append("state", state);
        authUrl.searchParams.append("scope", scope);

        return authUrl.toString();
    }

    async handleCallback(code, state) {
        // Similar to Facebook: exchange code for token
        const tokenUrl = new URL("https://graph.facebook.com/v18.0/oauth/access_token");
        tokenUrl.searchParams.append("client_id", this.clientId);
        tokenUrl.searchParams.append("client_secret", this.clientSecret);
        tokenUrl.searchParams.append("redirect_uri", this.redirectUri);
        tokenUrl.searchParams.append("code", code);

        const res = await fetch(tokenUrl.toString());
        if (!res.ok) throw new Error("Failed to exchange code for Instagram token");
        const tokenData = await res.json();

        // To get Instagram Business Account ID:
        // 1. Get Me (FB User) -> 2. Get Accounts (Pages) -> 3. Get connected IG Account
        // This is complex. We'll simplify by getting the FB user and assuming logic to find IG ID later.
        const meRes = await fetch(`https://graph.facebook.com/me?access_token=${tokenData.access_token}&fields=id,name`);
        const meData = await meRes.json();

        return {
            accessToken: tokenData.access_token,
            refreshToken: null,
            expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
            platformUserId: meData.id, // This is technically FB User ID, we'd need to resolve IG ID at publish time
            profileName: `IG via ${meData.name}`,
            profilePictureUrl: null,
        };
    }

    async publishPost(accessToken, content, platformUserId, imageBase64 = null) {
        // Logic would involve:
        // 1. Find the IG Business Account ID linked to the user's Page.
        // 2. Upload container (image/video).
        // 3. Publish container.

        // Placeholder for now as IG publishing is complex (2-step process)
        throw new Error("Instagram publishing requires finding the IG Business ID first. Implementation pending.");
    }
}
