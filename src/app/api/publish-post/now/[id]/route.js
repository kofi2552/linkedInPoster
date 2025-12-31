import { ScheduledPost, User } from "@/lib/models.js";
import { publishNowToLinkedIn } from "@/lib/linkedin.js";

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

    console.log("post user: ", user);

    if (!user || !user.linkedinAccessToken) {
      return Response.json(
        { error: "User not connected to LinkedIn" },
        { status: 401 }
      );
    }

    const PostUserId = user?.linkedinProfileId;
    const PostUserEmail = user?.email;

    console.log(
      `🚀 Publishing post for user with id: ${PostUserId} and email: ${PostUserEmail} to LinkedIn`
    );

    if (!PostUserEmail) {
      console.error("🚨 User email missing");
      return Response.json({ error: "User email missing" }, { status: 500 });
    }
    // Publish to LinkedIn immediately
    console.log("Publishing post. content length:", post.content.length);
    console.log("Has imageBase64?", !!post.imageBase64, post.imageBase64 ? post.imageBase64.length : 0);

    const result = await publishNowToLinkedIn(
      user.linkedinAccessToken, // ✅ Use the user's stored access token
      post.content,
      PostUserId,
      PostUserEmail,
      post.imageBase64 // Pass the image data if available
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
