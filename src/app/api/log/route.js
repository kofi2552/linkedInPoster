import { NextResponse } from "next/server";
import { ActivityLog } from "@/lib/models";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { action, details } = body;

        let ipAddress = request.headers.get("x-forwarded-for") || request.ip;
        if (ipAddress && ipAddress.includes(",")) {
            ipAddress = ipAddress.split(",")[0];
        }

        await ActivityLog.create({
            userId: session.user.id,
            action,
            details: typeof details === 'object' ? JSON.stringify(details) : details,
            ipAddress
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error logging activity:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
