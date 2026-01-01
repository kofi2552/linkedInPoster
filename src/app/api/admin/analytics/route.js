import { NextResponse } from "next/server";
import { User, ActivityLog, Topic, ScheduledPost } from "@/lib/models";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Op, Sequelize } from "sequelize";

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminUser = await User.findOne({ where: { email: session.user.email } });
        if (!adminUser || !adminUser.isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 1. Total Users
        const totalUsers = await User.count();

        // 2. Active Users (Last 24h)
        const oneDayAgo = new Date(new Date() - 24 * 60 * 60 * 1000);
        const activeUsersCount = await ActivityLog.count({
            where: {
                createdAt: { [Op.gte]: oneDayAgo },
                action: "LOGIN"
            },
            distinct: true,
            col: 'userId'
        });

        // 3. Total Actions
        const totalActions = await ActivityLog.count();

        // 4. Activity Logs (Searchable)
        const search = request.nextUrl.searchParams.get("search");
        const whereClause = {};

        if (search) {
            const users = await User.findAll({
                where: {
                    [Op.or]: [
                        { email: { [Op.like]: `%${search}%` } },
                        { name: { [Op.like]: `%${search}%` } }
                    ]
                },
                attributes: ['id']
            });
            const userIds = users.map(u => u.id);

            if (userIds.length > 0) {
                whereClause.userId = { [Op.in]: userIds };
            } else {
                // If search found no users, valid to return empty logs or check if search matches action/details
                whereClause[Op.or] = [
                    { action: { [Op.like]: `%${search}%` } },
                    { details: { [Op.like]: `%${search}%` } }
                ];
            }
        }

        const logs = await ActivityLog.findAll({
            where: whereClause,
            limit: 100, // Increased limit for detailed view
            order: [["createdAt", "DESC"]],
            include: [{ model: User, attributes: ["email", "name"] }]
        });

        // Remove "Popular Pages" aggregation as per request to focus on table
        return NextResponse.json({
            stats: {
                totalUsers,
                activeUsers24h: activeUsersCount,
                totalActions
            },
            logs
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching analytics:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
