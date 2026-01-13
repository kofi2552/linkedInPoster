import { BasePlatform } from "./base.js";
import { User } from "../models.js";

export class LinkedInPlatform extends BasePlatform {
    constructor() {
        super("linkedin");
        this.clientId = process.env.LINKEDIN_CLIENT_ID;
        this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
        this.redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/linkedin/callback`;
    }

    async getAuthUrl(userId) {
        const scope = "w_member_social openid email profile";
        const state = Buffer.from(JSON.stringify({ userId })).toString("base64");

        const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
        authUrl.searchParams.append("response_type", "code");
        authUrl.searchParams.append("client_id", this.clientId);
        authUrl.searchParams.append("redirect_uri", this.redirectUri);
        authUrl.searchParams.append("scope", scope);
        authUrl.searchParams.append("state", state);

        return authUrl.toString();
    }

    async handleCallback(code, state) {
        const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                client_id: this.clientId,
                client_secret: this.clientSecret,
                redirect_uri: this.redirectUri,
            }).toString(),
        });

        if (!tokenResponse.ok) throw new Error("Failed to exchange code for token");
        const tokenData = await tokenResponse.json();

        // Fetch user info to get platformUserId and profileName
        const meResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
                "X-Restli-Protocol-Version": "2.0.0",
            },
        });

        if (!meResponse.ok) throw new Error("Failed to fetch LinkedIn user profile");
        const meData = await meResponse.json();

        return {
            accessToken: tokenData.access_token,
            refreshToken: null, // LinkedIn v2 doesn't always provide refresh tokens in this flow
            expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
            platformUserId: meData.sub,
            profileName: `${meData.given_name} ${meData.family_name}`,
            profilePictureUrl: meData.picture,
        };
    }

    async publishPost(accessToken, content, platformUserId, imageBase64 = null) {
        try {
            const authorUrn = `urn:li:person:${platformUserId}`;
            let imageUrn = null;

            if (imageBase64) {
                // Step 1: Register upload
                const registerRes = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                        "X-Restli-Protocol-Version": "2.0.0",
                    },
                    body: JSON.stringify({
                        registerUploadRequest: {
                            recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
                            owner: authorUrn,
                            serviceRelationships: [{
                                relationshipType: "OWNER",
                                identifier: "urn:li:userGeneratedContent",
                            }],
                        },
                    }),
                });

                const registerData = await registerRes.json();
                if (!registerRes.ok) throw new Error(`Image registration failed: ${registerData.message}`);

                const uploadUrl = registerData.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl;
                imageUrn = registerData.value.asset;

                // Step 2: Upload image
                const buffer = Buffer.from(imageBase64, "base64");
                const uploadRes = await fetch(uploadUrl, {
                    method: "PUT",
                    headers: { "Content-Type": "application/octet-stream" },
                    body: buffer,
                });

                if (!uploadRes.ok) throw new Error("Image upload failed");
            }

            // Step 3: Publish post
            const postBody = {
                author: authorUrn,
                lifecycleState: "PUBLISHED",
                specificContent: {
                    "com.linkedin.ugc.ShareContent": {
                        shareCommentary: { text: this.formatPostText(content) },
                        shareMediaCategory: imageUrn ? "IMAGE" : "NONE",
                        media: imageUrn ? [{
                            status: "READY",
                            description: { text: "Generated by AI" },
                            media: imageUrn,
                            title: { text: "Post Image" }
                        }] : [],
                    },
                },
                visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
            };

            const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                    "X-Restli-Protocol-Version": "2.0.0",
                },
                body: JSON.stringify(postBody),
            });

            if (!postRes.ok) {
                const error = await postRes.json();
                throw new Error(error.message || "Failed to publish to LinkedIn");
            }

            const data = await postRes.json();
            return { success: true, postId: data.id };
        } catch (error) {
            console.error("LinkedIn publish error:", error);
            return { success: false, error: error.message };
        }
    }

    formatPostText(rawText) {
        if (!rawText) return "";
        return rawText
            .replace(/\*/g, "")
            .replace(/\r\n/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .trim();
    }
}
