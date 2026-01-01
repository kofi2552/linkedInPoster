import { User } from "@/lib/models";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const user = await User.findByPk(userId);

        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }

        await user.update({ hasSeenOnboarding: true });

        return Response.json({ success: true });
    } catch (error) {
        console.error("Error updating onboarding status:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
