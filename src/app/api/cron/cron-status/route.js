import { NextResponse } from 'next/server';
import { CronHeartbeat } from "@/lib/models.js";
import { Op } from "sequelize";

export async function GET() {
    try {
        // 1. Fetch latest successful heartbeat
        const lastHeartbeat = await CronHeartbeat.findOne({
            order: [['lastRunAt', 'DESC']],
        });

        if (!lastHeartbeat) {
            // No runs yet
            return NextResponse.json({
                success: false,
                message: "Scheduler has never ran",
                status: "offline"
            }, { status: 200 }); // Status 200 so frontend handles logic, or 503? User logic expects success:true for 'connected'.
        }

        // 2. Check if it's stale (older than 20 minutes)
        // Cron runs every 15 mins. Give it 5 min buffer.
        const twentyFiveMinutesAgo = new Date(Date.now() - 25 * 60 * 1000);

        if (lastHeartbeat.lastRunAt < twentyFiveMinutesAgo) {
            return NextResponse.json({
                success: false,
                message: "Scheduler is stalled",
                lastRun: lastHeartbeat.lastRunAt,
                status: "stalled"
            }, { status: 200 });
        }

        return NextResponse.json({
            success: true,
            message: "Scheduler is active",
            lastRun: lastHeartbeat.lastRunAt,
            status: "online"
        }, { status: 200 });

    } catch (error) {
        console.error('Heartbeat check failed:', error);
        return NextResponse.json({
            success: false,
            message: "Internal Error Checking Status",
            error: error.message
        }, { status: 500 });
    }
}
