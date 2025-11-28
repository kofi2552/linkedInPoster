import { Topic } from "@/lib/models.js";

// GET all topics for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    const topics = await Topic.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    return Response.json(topics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST create new topic
export async function POST(request) {
  try {
    const { userId, title, description } = await request.json();

    if (!userId || !title) {
      return Response.json(
        { error: "userId and title are required" },
        { status: 400 }
      );
    }

    const topic = await Topic.create({
      userId,
      title,
      description,
    });

    return Response.json(topic, { status: 201 });
  } catch (error) {
    console.error("Error creating topic:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
