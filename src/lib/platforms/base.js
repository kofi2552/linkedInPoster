
export class BasePlatform {
    constructor(platformName) {
        this.name = platformName;
    }

    /**
     * Get the authorization URL for the platform.
     * @param {string} userId - The user ID.
     * @returns {Promise<string>}
     */
    async getAuthUrl(userId) {
        throw new Error("getAuthUrl not implemented");
    }

    /**
     * Handle the callback from the OAuth flow.
     * @param {string} code - The code from the callback.
     * @param {string} state - The state from the callback.
     * @returns {Promise<{accessToken: string, refreshToken: string, expiresAt: Date, platformUserId: string, profileName: string}>}
     */
    async handleCallback(code, state) {
        throw new Error("handleCallback not implemented");
    }

    /**
     * Publish a post to the platform.
     * @param {string} accessToken - The access token.
     * @param {string} content - The post content.
     * @param {string} platformUserId - The platform user ID.
     * @param {string} imageBase64 - Optional image data.
     * @returns {Promise<{success: boolean, postId: string, error: string}>}
     */
    async publishPost(accessToken, content, platformUserId, imageBase64 = null) {
        throw new Error("publishPost not implemented");
    }
}
