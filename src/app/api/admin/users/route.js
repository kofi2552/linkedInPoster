import { NextResponse } from "next/server";
import { User } from "@/lib/models.js";
import sequelize from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await sequelize.sync();

        // Strict Database Check for Admin Status
        const requestingUser = await User.findOne({ where: { email: session.user.email } });
        if (!requestingUser || !requestingUser.isAdmin) {
            return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        }

        const users = await User.findAll({
            order: [["createdAt", "DESC"]],
            attributes: { exclude: ["linkedinAccessToken"] }
        });

        // Fetch post counts for all users
        const postCounts = await sequelize.query(`
            SELECT "userId", "status", COUNT(*) as "count"
            FROM "scheduled_posts"
            GROUP BY "userId", "status"
        `, { type: sequelize.QueryTypes.SELECT });

        const usersWithCounts = users.map(user => {
            const userCounts = postCounts.filter(p => p.userId === user.id);
            const publishedRequest = userCounts.find(p => p.status === 'published');
            const pendingRequest = userCounts.find(p => p.status === 'pending');
            const failedRequest = userCounts.find(p => p.status === 'failed');

            // Handle both string and number return types from COUNT
            const publishedCount = publishedRequest ? parseInt(publishedRequest.count, 10) : 0;
            const scheduledCount = pendingRequest ? parseInt(pendingRequest.count, 10) : 0;
            const failedCount = failedRequest ? parseInt(failedRequest.count, 10) : 0;

            return {
                ...user.toJSON(),
                publishedCount,
                scheduledCount,
                failedCount
            };
        });

        return NextResponse.json(usersWithCounts);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { userId, isPremium, premiumExpiresAt, isAdmin } = body;

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        // await sequelize.sync();

        // Strict Database Check for Admin Status
        const requestingUser = await User.findOne({ where: { email: session.user.email } });

        // Allow access if:
        // 1. User is an Admin
        // 2. OR User is updating THEMSELVES (Dev Feature: "Grant/Revoke Admin")
        // const isSelfUpdate = requestingUser && requestingUser.id === userId;

        if (!requestingUser || (!requestingUser.isAdmin)) {
            return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (isPremium !== undefined) {
            user.isPremium = isPremium;
            if (isPremium) {
                const now = new Date();
                const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                user.premiumStartedAt = now;
                user.premiumExpiresAt = thirtyDaysLater;
            } else {
                user.premiumStartedAt = null;
                user.premiumExpiresAt = null;
            }
        }

        if (premiumExpiresAt !== undefined) user.premiumExpiresAt = premiumExpiresAt;
        if (isAdmin !== undefined) user.isAdmin = isAdmin;

        await user.save();

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        // Strict Database Check for Admin Status
        const requestingUser = await User.findOne({ where: { email: session.user.email } });
        if (!requestingUser || !requestingUser.isAdmin) {
            return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Deleting the user will cascade to Topics, Schedules, and ScheduledPosts 
        // because of the associations defined in models.js
        await user.destroy();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}
