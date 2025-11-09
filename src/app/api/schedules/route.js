import { Schedule, ScheduledPost, Topic } from "@/lib/models.js";
import { generateLinkedInPost } from "@/lib/gemini.js";

// GET all schedules for a topic
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get("topicId");

    if (!topicId) {
      return Response.json({ error: "topicId is required" }, { status: 400 });
    }

    const schedules = await Schedule.findAll({
      where: { topicId },
      include: [{ model: Topic }],
      order: [["createdAt", "DESC"]],
    });

    return Response.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST create new schedule
export async function POST(request) {
  try {
    const { userId, topicId, frequency, scheduledTime, dayOfWeek } =
      await request.json();

    console.log("Creating schedule with:", {
      userId,
      topicId,
      frequency,
      scheduledTime,
      dayOfWeek,
    });

    if (!topicId || !frequency || !scheduledTime) {
      return Response.json(
        { error: "topicId, frequency, and scheduledTime are required" },
        { status: 400 }
      );
    }

    const schedule = await Schedule.create({
      topicId,
      userId,
      frequency,
      scheduledTime,
      dayOfWeek,
      isActive: true,
      lastGeneratedAt: new Date(),
    });

    // 2️⃣ Calculate next scheduled time
    const now = new Date();
    const [hours, minutes] = scheduledTime.split(":");
    const next = new Date();
    next.setHours(hours, minutes, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);

    // 3️⃣ Get topic for content
    const topic = await Topic.findByPk(topicId);

    const content = await generateLinkedInPost(
      topic.title,
      topic.description ||
        "Generate a short engaging linkedin-style post like a professional in the educational tech sector."
    );

    // 4️⃣ Create ScheduledPost (inactive, pending)
    await ScheduledPost.create({
      scheduleId: schedule.id,
      userId,
      topicId,
      content: content.post,
      scheduledFor: next,
      isActive: false,
      status: "pending",
    });

    return Response.json(schedule, { status: 201 });
  } catch (error) {
    console.error("Error creating schedule:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// PATCH update schedule
export async function PATCH(request) {
  try {
    const { id, isActive, frequency, scheduledTime, dayOfWeek } =
      await request.json();

    if (!id) {
      return Response.json({ error: "id is required" }, { status: 400 });
    }

    const schedule = await Schedule.findByPk(id);
    if (!schedule) {
      return Response.json({ error: "Schedule not found" }, { status: 404 });
    }

    await schedule.update({
      ...(isActive !== undefined && { isActive }),
      ...(frequency && { frequency }),
      ...(scheduledTime && { scheduledTime }),
      ...(dayOfWeek !== undefined && { dayOfWeek }),
    });

    return Response.json(schedule);
  } catch (error) {
    console.error("Error updating schedule:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
