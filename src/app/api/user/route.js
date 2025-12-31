
import { User } from "@/lib/models.js";

// GET user details
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return Response.json({ error: "userId is required" }, { status: 400 });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }

        return Response.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}

// PATCH update user details
export async function PATCH(request) {
    try {
        const { userId, profession, industry, tone, bio, phoneNumber } = await request.json();

        if (!userId) {
            return Response.json({ error: "userId is required" }, { status: 400 });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }

        const updatedUser = await user.update({
            profession,
            industry,
            tone,
            bio,
            phoneNumber
        });

        return Response.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
