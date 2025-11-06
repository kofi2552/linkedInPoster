import { ScheduledPost } from "@/lib/models.js"

export async function DELETE(request, { params }) {
  try {
    const { id } = params

    const post = await ScheduledPost.findByPk(id)
    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 })
    }

    await post.destroy()

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error deleting post:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
