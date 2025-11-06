import { ScheduledPost, User } from "@/lib/models.js";
import { publishToLinkedIn } from "@/lib/linkedin.js";

const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

export async function POST(req, { params }) {
  try {
    const { id: postId } = await params;

    if (!postId) {
      return Response.json({ error: "postId is required" }, { status: 400 });
    }

    // Find the post
    const post = await ScheduledPost.findByPk(postId);
    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    // Find the user who owns the post
    const user = await User.findByPk(post.userId);
    if (!user || !user.linkedinAccessToken) {
      return Response.json(
        { error: "User not connected to LinkedIn" },
        { status: 401 }
      );
    }

    const PostUserId = user?.linkedinProfileId;

    // Publish to LinkedIn immediately
    const result = await publishToLinkedIn(
      accessToken,
      post.content,
      PostUserId
    );

    if (result.success) {
      await post.update({
        isActive: true,
        status: "published",
        publishedAt: new Date(),
        linkedinPostId: result.postId,
      });

      console.log(`✅ Published post ${post.id} for user ${user.id}`);
      return Response.json({ success: true, post });
    } else {
      await post.update({ status: "failed" });
      console.warn(`❌ Failed to publish post ${post.id}: ${result.error}`);
      return Response.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.log("🚨 Error publishing post:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
