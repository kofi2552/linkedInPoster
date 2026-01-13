import { User, SocialAccount } from "@/lib/models.js";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return Response.json({ error: "userId is required" }, { status: 400 });
        }

        const accounts = await SocialAccount.findAll({
            where: { userId: userId, isActive: true },
            attributes: ['platform', 'profileName']
        });

        const connectedPlatforms = accounts.map(a => ({
            platform: a.platform,
            profileName: a.profileName
        }));

        // Legacy check for LinkedIn in User model if not in SocialAccount
        const user = await User.findByPk(userId);
        if (user && user.linkedinAccessToken) {
            if (!connectedPlatforms.find(p => p.platform === 'linkedin')) {
                connectedPlatforms.push({ platform: 'linkedin', profileName: 'LinkedIn User' });
            }
        }

        return Response.json({ connectedPlatforms });
    } catch (error) {
        console.error("Error fetching connections:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}
