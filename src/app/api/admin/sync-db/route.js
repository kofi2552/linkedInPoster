import sequelize from "@/lib/db";
import { User, Topic, Schedule, ScheduledPost } from "@/lib/models";

export async function GET(request) {
    try {
        console.log("Starting manual DB sync...");
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        console.log("DB Sync completed.");

        return Response.json({ success: true, message: "Database synchronized successfully." });
    } catch (error) {
        console.error("Sync failed:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
