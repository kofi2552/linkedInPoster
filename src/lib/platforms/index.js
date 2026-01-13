import { LinkedInPlatform } from "./linkedin.js";
import { FacebookPlatform } from "./facebook.js";
import { TwitterPlatform } from "./twitter.js";
import { InstagramPlatform } from "./instagram.js";
import { TikTokPlatform } from "./tiktok.js";

const platforms = {
    linkedin: new LinkedInPlatform(),
    facebook: new FacebookPlatform(),
    twitter: new TwitterPlatform(),
    instagram: new InstagramPlatform(),
    tiktok: new TikTokPlatform(),
};

/**
 * Get a platform instance by name.
 * @param {string} platformName - The name of the platform.
 * @returns {import('./base').BasePlatform}
 */
export function getPlatform(platformName) {
    const platform = platforms[platformName.toLowerCase()];
    if (!platform) {
        throw new Error(`Platform ${platformName} not supported`);
    }
    return platform;
}

export function getAllSupportedPlatforms() {
    return Object.keys(platforms);
}
