import { ScheduledPost, Schedule, Topic } from "@/lib/models.js";

// GET all scheduled posts
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    const where = { userId };
    if (status) where.status = status;

    const posts = await ScheduledPost.findAll({
      where: {
        userId,
      },
      include: [
        {
          model: Schedule,
          include: [{ model: Topic }],
        },
        { model: Topic },
      ],
      order: [["scheduledFor", "ASC"]],
    });

    return Response.json(posts);
  } catch (error) {
    console.error("Error fetching scheduled posts:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST create new scheduled post
export async function POST(request) {
  try {
    const { scheduleId, topicId, content, scheduledFor } = await request.json();

    console.log("Creating scheduled post with data:", {
      scheduleId,
      topicId,
      content,
      scheduledFor,
    });

    if (!scheduleId || !topicId || !content || !scheduledFor) {
      return Response.json(
        {
          error: "scheduleId, topicId, content, and scheduledFor are required",
        },
        { status: 400 }
      );
    }

    const post = await ScheduledPost.create({
      scheduleId,
      topicId,
      content,
      scheduledFor,
      status: "pending",
    });

    return Response.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating scheduled post:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// PATCH update scheduled post
export async function PATCH(request) {
  try {
    const { id, content, status } = await request.json();

    if (!id) {
      return Response.json({ error: "id is required" }, { status: 400 });
    }

    const post = await ScheduledPost.findByPk(id);
    if (!post) {
      return Response.json(
        { error: "Scheduled post not found" },
        { status: 404 }
      );
    }

    await post.update({
      ...(content && { content }),
      ...(status && { status }),
    });

    return Response.json(post);
  } catch (error) {
    console.error("Error updating scheduled post:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
