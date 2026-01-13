import { ScheduledPost, User, SocialAccount } from "@/lib/models.js";
import { getPlatform } from "@/lib/platforms/index.js";

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

    const platformName = post.platform || "linkedin";
    const platform = getPlatform(platformName);

    // 1. Try to find credentials in SocialAccount (new clean way)
    let account = await SocialAccount.findOne({
      where: { userId: post.userId, platform: platformName, isActive: true }
    });

    let accessToken, platformUserId;

    if (account) {
      accessToken = account.accessToken;
      platformUserId = account.platformUserId;
    } else if (platformName === "linkedin") {
      // 2. Fallback to User model (legacy way)
      const user = await User.findByPk(post.userId);
      if (user && user.linkedinAccessToken) {
        accessToken = user.linkedinAccessToken;
        platformUserId = user.linkedinProfileId;
      }
    }

    if (!accessToken) {
      return Response.json(
        { error: `User not connected to ${platformName}` },
        { status: 401 }
      );
    }

    console.log(`🚀 Publishing post for user ${post.userId} to ${platformName}`);

    const result = await platform.publishPost(
      accessToken,
      post.content,
      platformUserId,
      post.imageBase64
    );

    if (result.success) {
      await post.update({
        isActive: true,
        status: "published",
        publishedAt: new Date(),
        externalPostId: result.postId,
        linkedinPostId: platformName === 'linkedin' ? result.postId : post.linkedinPostId, // keep legacy field updated
      });

      console.log(`✅ Published post ${post.id} for user ${post.userId} on ${platformName}`);
      return Response.json({ success: true, post });
    } else {
      await post.update({ status: "failed", errorMessage: result.error });
      console.warn(`❌ Failed to publish post ${post.id}: ${result.error}`);
      return Response.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("🚨 Error publishing post:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
