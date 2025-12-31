import { Schedule, ScheduledPost, Topic } from "@/lib/models.js";
import { generateLinkedInPost } from "@/lib/gemini.js";
import { generateImage } from "@/lib/image.js";

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

    let imageBase64 = null;
    if (topic.includeImage) {
      try {
        console.log("Generating image for topic:", topic.title);
        // Use Gemini to create an image prompt based on the topic
        const imagePrompt = `Generate a prompt for an AI image generator to create a professional LinkedIn post image about: "${topic.title}". The image should be modern, clean, and suitable for a business audience. No text in the image. Return only the prompt string.`;

        const promptResponse = await generateLinkedInPost(imagePrompt, "Keep it under 200 characters, descriptive but concise.");
        const finalPrompt = promptResponse.post || `${topic.title} professional linkedin background, clean, modern, 4k`;

        console.log("Image Prompt:", finalPrompt);
        imageBase64 = await generateImage(finalPrompt);
      } catch (imgError) {
        console.error("Failed to generate image:", imgError);
        // We continue without image if generation fails
      }
    }

    // 4️⃣ Create ScheduledPost (inactive, pending)
    await ScheduledPost.create({
      scheduleId: schedule.id,
      userId,
      topicId,
      content: content.post || content,
      scheduledFor: next,
      isActive: false,
      status: "pending",
      imageBase64: imageBase64,
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
