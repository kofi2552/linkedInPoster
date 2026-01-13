import { getPlatform } from "@/lib/platforms/index.js";

export async function GET(request, { params }) {
    try {
        const { platform: platformName } = await params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return Response.json({ error: "userId is required" }, { status: 400 });
        }

        const platform = getPlatform(platformName);
        const authUrl = await platform.getAuthUrl(userId);

        return Response.json({ authUrl });
    } catch (error) {
        console.error(`${params.platform} auth error:`, error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
