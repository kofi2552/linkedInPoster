import { Topic, Schedule, User } from "@/lib/models.js";
import { Op } from "sequelize";

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
      include: [Schedule],
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
    const { userId, title, description, postLength, includeImage } = await request.json();

    if (!userId || !title) {
      return Response.json(
        { error: "userId and title are required" },
        { status: 400 }
      );
    }

    // Check Premium Status and Limits
    const user = await User.findByPk(userId);
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    if (!user.isPremium) {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const weeklyCount = await Topic.count({
        where: {
          userId,
          createdAt: {
            [Op.gte]: oneWeekAgo
          }
        }
      });

      if (weeklyCount >= 3) {
        return Response.json(
          { error: "Free plan limit reached (3 posts/week). Please upgrade to Premium for unlimited posts." },
          { status: 403 }
        );
      }
    }

    const topic = await Topic.create({
      userId,
      title,
      description,
      postLength: postLength || "short",
      includeImage: includeImage || false,
    });

    return Response.json(topic, { status: 201 });
  } catch (error) {
    console.error("Error creating topic:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
