import { Topic } from "@/lib/models.js";

// Update topic
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description } = body;

    if (!id) {
      return Response.json({ error: "Topic ID is required" }, { status: 400 });
    }

    const topic = await Topic.findByPk(id);

    if (!topic) {
      return Response.json({ error: "Topic not found" }, { status: 404 });
    }

    // Update fields
    if (title !== undefined) topic.title = title;
    if (description !== undefined) topic.description = description;

    await topic.save();

    return Response.json(topic);
  } catch (error) {
    console.error("Error updating topic:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// delete topic
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    console.log("deleting topic with id: ", id);

    if (!id) {
      return Response.json({ error: "Topic ID is required" }, { status: 400 });
    }

    // Find topic
    const topic = await Topic.findByPk(id);

    if (!topic) {
      return Response.json({ error: "Topic not found" }, { status: 404 });
    }

    // Delete topic
    await topic.destroy();

    console.log("topic deleted successfully");

    return Response.json({
      success: true,
      message: "Topic deleted successfully",
    });
  } catch (error) {
    console.error("🔥 Error deleting topic:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
