import { User } from "@/lib/models.js";

export async function publishToLinkedIn(accessToken, content, PostuserId) {
  //console.log("access token being used:", accessToken);

  try {
    let authorUrn = null;
    let response = null;

    // ✅ If we already have the LinkedIn user ID stored
    if (PostuserId) {
      authorUrn = `urn:li:person:${PostuserId}`;
    } else {
      // ✅ Otherwise, fetch it from LinkedIn's /userinfo endpoint
      const meResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
      });

      if (!meResponse.ok) {
        const error = await meResponse.json();
        throw new Error(
          error.message || "Failed to fetch LinkedIn user profile"
        );
      }

      const meData = await meResponse.json();
      //console.log("LinkedIn user profile data:", meData);

      if (!meData?.sub) {
        throw new Error("Missing 'sub' field in LinkedIn profile data.");
      }

      authorUrn = `urn:li:person:${meData.sub}`;
      console.log("LinkedIn author URN:", authorUrn);

      // Optional: store the LinkedIn ID in your DB for next time
      await User.update(
        { linkedinProfileId: meData.sub },
        { where: { id: PostuserId } }
      );
    }

    // ✅ Now create the LinkedIn post
    response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: authorUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: content },
            shareMediaCategory: "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to publish to LinkedIn");
    }

    const data = await response.json();
    console.log("✅ LinkedIn post created:", data);

    return { success: true, postId: data.id };
  } catch (error) {
    console.error("🚨 LinkedIn publishing error:", error);
    return { success: false, error: error.message };
  }
}

export async function getLinkedInProfile(accessToken) {
  try {
    const response = await fetch("https://api.linkedin.com/v2/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("LinkedIn profile response status:", response);

    if (!response.ok) {
      throw new Error("Failed to fetch LinkedIn profile");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching LinkedIn profile:", error);
    throw error;
  }
}
