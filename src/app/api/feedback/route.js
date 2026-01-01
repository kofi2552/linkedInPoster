import { NextResponse } from "next/server";
import { User, Feedback } from "@/lib/models.js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Strict Database Check for Admin Status
        const requestingUser = await User.findOne({ where: { email: session.user.email } });
        if (!requestingUser || !requestingUser.isAdmin) {
            return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        }

        const feedback = await Feedback.findAll({
            order: [["createdAt", "DESC"]],
            include: [{ model: User, attributes: ["email"] }]
        });

        return NextResponse.json(feedback);
    } catch (error) {
        console.error("Error fetching feedback:", error);
        return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { type, content } = body;

        if (!content) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        const feedback = await Feedback.create({
            userId: session.user.id,
            type: type || "suggestion",
            content
        });

        return NextResponse.json({ success: true, feedback });
    } catch (error) {
        console.error("Error submitting feedback:", error);
        return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
    }
}
