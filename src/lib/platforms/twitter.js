import { BasePlatform } from "./base.js";

export class TwitterPlatform extends BasePlatform {
    constructor() {
        super("twitter");
        this.clientId = process.env.TWITTER_CLIENT_ID;
        this.clientSecret = process.env.TWITTER_CLIENT_SECRET;
        this.redirectUri = process.env.TWITTER_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/twitter/callback`;
    }

    async getAuthUrl(userId) {
        // PKCE is required for Twitter OAuth 2.0
        // For simplicity in this demo, we assume the classic detailed PKCE flow is handled or we use a library if available.
        // Here we'll manually construct the URL with a static challenge for demonstration, 
        // but in production, you should generate a random code_verifier and store it in state or session.

        const scope = "tweet.read tweet.write users.read offline.access";
        const state = Buffer.from(JSON.stringify({ userId })).toString("base64");
        const codeChallenge = "challenge"; // In real app: generateCodeChallenge(codeVerifier)

        const authUrl = new URL("https://twitter.com/i/oauth2/authorize");
        authUrl.searchParams.append("response_type", "code");
        authUrl.searchParams.append("client_id", this.clientId);
        authUrl.searchParams.append("redirect_uri", this.redirectUri);
        authUrl.searchParams.append("scope", scope);
        authUrl.searchParams.append("state", state);
        authUrl.searchParams.append("code_challenge", codeChallenge);
        authUrl.searchParams.append("code_challenge_method", "plain");

        return authUrl.toString();
    }

    async handleCallback(code, state) {
        // Exchange code for token
        const tokenUrl = "https://api.twitter.com/2/oauth2/token";
        const basicAuth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");

        const res = await fetch(tokenUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${basicAuth}`,
            },
            body: new URLSearchParams({
                code,
                grant_type: "authorization_code",
                client_id: this.clientId,
                redirect_uri: this.redirectUri,
                code_verifier: "challenge", // Must match the one used in auth url
            }).toString(),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(`Twitter token exchange failed: ${JSON.stringify(err)}`);
        }

        const tokenData = await res.json();

        // Get current user info
        const meRes = await fetch("https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username", {
            headers: {
                "Authorization": `Bearer ${tokenData.access_token}`,
            },
        });

        if (!meRes.ok) throw new Error("Failed to fetch Twitter user profile");
        const meData = await meRes.json();
        const user = meData.data;

        return {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
            platformUserId: user.id,
            profileName: `${user.name} (@${user.username})`,
            profilePictureUrl: user.profile_image_url,
        };
    }

    async publishPost(accessToken, content, platformUserId, imageBase64 = null) {
        try {
            // Twitter API v2 Manage Tweets
            // Note: Media upload requires v1.1 API, which is a bit complex to mix with v2 Oauth.
            // For this MVP we will stick to text-only or use v2 media if available (currently v2 is text heavy).

            const body = { text: content };

            const res = await fetch("https://api.twitter.com/2/tweets", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok || data.errors) {
                throw new Error(data.errors ? data.errors[0].message : "Twitter post failed");
            }

            return { success: true, postId: data.data.id };
        } catch (error) {
            console.error("Twitter publish error:", error);
            return { success: false, error: error.message };
        }
    }
}
