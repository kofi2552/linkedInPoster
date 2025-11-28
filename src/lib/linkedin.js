import { User } from "@/lib/models.js";

export async function publishNowToLinkedIn(
  accessToken,
  content,
  PostuserId,
  PostUserEmail
) {
  console.log("posting content: ", content);

  try {
    let authorUrn = null;

    // ✅ Use stored LinkedIn user ID if available
    if (PostuserId) {
      authorUrn = `urn:li:person:${PostuserId}`;
    } else {
      // ✅ Otherwise, fetch user info from LinkedIn
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

      if (!meData?.sub) {
        throw new Error("Missing 'sub' field in LinkedIn profile data.");
      }

      authorUrn = `urn:li:person:${meData.sub}`;
      console.log("LinkedIn author URN:", authorUrn);

      // Optional: persist LinkedIn ID for next time
      await User.update(
        { linkedinProfileId: meData.sub },
        { where: { email: PostUserEmail } }
      );
    }

    // ✅ Clean up and format the post text
    function formatPostText(rawText) {
      return rawText
        .replace(/\*/g, "") // remove all asterisks
        .replace(/\r\n/g, "\n") // normalize line endings
        .replace(/\n{3,}/g, "\n\n") // limit excessive blank lines
        .trim();
    }

    const formattedPost = formatPostText(content);

    // 📝 Build text-only LinkedIn post body
    const postBody = {
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: formattedPost },
          shareMediaCategory: "NONE", // 🚫 no image
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    // ✅ Publish the post
    const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(postBody),
    });

    if (!postRes.ok) {
      const error = await postRes.json();
      throw new Error(error.message || "Failed to publish to LinkedIn");
    }

    const data = await postRes.json();
    console.log("✅ LinkedIn post created:", data);

    return { success: true, postId: data.id };
  } catch (error) {
    console.error("🚨 LinkedIn publishing error:", error);
    return { success: false, error: error.message };
  }
}

export async function publishToLinkedIn(
  accessToken,
  content,
  PostuserId,
  PostUserEmail
) {
  console.log("posting content: ", content);

  try {
    let authorUrn = null;

    // ✅ Use stored LinkedIn user ID if available
    if (PostuserId) {
      authorUrn = `urn:li:person:${PostuserId}`;
    } else {
      // ✅ Otherwise, fetch user info from LinkedIn
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

      if (!meData?.sub) {
        throw new Error("Missing 'sub' field in LinkedIn profile data.");
      }

      authorUrn = `urn:li:person:${meData.sub}`;
      console.log("LinkedIn author URN:", authorUrn);

      // Optional: persist LinkedIn ID for next time
      await User.update(
        { linkedinProfileId: meData.sub },
        { where: { email: PostUserEmail } }
      );
    }

    // ✅ Clean up and format the post text
    function formatPostText(rawText) {
      return rawText
        .replace(/\*/g, "") // remove all asterisks
        .replace(/\r\n/g, "\n") // normalize line endings
        .replace(/\n{3,}/g, "\n\n") // limit excessive blank lines
        .trim();
    }

    const formattedPost = formatPostText(content);

    // 📝 Build text-only LinkedIn post body
    const postBody = {
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: formattedPost },
          shareMediaCategory: "NONE", // 🚫 no image
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    // ✅ Publish the post
    const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(postBody),
    });

    if (!postRes.ok) {
      const error = await postRes.json();
      throw new Error(error.message || "Failed to publish to LinkedIn");
    }

    const data = await postRes.json();
    console.log("✅ LinkedIn post created:", data);

    return { success: true, postId: data.id };
  } catch (error) {
    console.error("🚨 LinkedIn publishing error:", error);
    return { success: false, error: error.message };
  }
}

// export async function publishToLinkedIn(
//   accessToken,
//   content,
//   PostuserId,
//   PostUserEmail
// ) {
//   try {
//     let authorUrn = null;
//     let imageUrn = null;
//     const { post, imageBase64 } = content;

//     // ✅ If we already have the LinkedIn user ID stored
//     if (PostuserId) {
//       authorUrn = `urn:li:person:${PostuserId}`;
//     } else {
//       // ✅ Otherwise, fetch it from LinkedIn's /userinfo endpoint
//       const meResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           "X-Restli-Protocol-Version": "2.0.0",
//         },
//       });

//       if (!meResponse.ok) {
//         const error = await meResponse.json();
//         throw new Error(
//           error.message || "Failed to fetch LinkedIn user profile"
//         );
//       }

//       const meData = await meResponse.json();
//       //console.log("LinkedIn user profile data:", meData);

//       if (!meData?.sub) {
//         throw new Error("Missing 'sub' field in LinkedIn profile data.");
//       }

//       authorUrn = `urn:li:person:${meData.sub}`;
//       console.log("LinkedIn author URN:", authorUrn);

//       // Optional: store the LinkedIn ID in your DB for next time
//       await User.update(
//         { linkedinProfileId: meData.sub },
//         { where: { email: PostUserEmail } }
//       );
//     }

//     function formatPostText(rawText) {
//       return rawText
//         .replace(/\r\n/g, "\n") // normalize line endings
//         .replace(/\n{3,}/g, "\n\n") // prevent too many blank lines
//         .trim();
//     }
//     const formattedPost = formatPostText(post);
//     // 🖼 Upload image if provided
//     if (imageBase64) {
//       //console.log("Uploading image to LinkedIn...");

//       // Step 1: Register upload
//       const registerRes = await fetch(
//         "https://api.linkedin.com/v2/assets?action=registerUpload",
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             registerUploadRequest: {
//               recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
//               owner: authorUrn,
//               serviceRelationships: [
//                 {
//                   relationshipType: "OWNER",
//                   identifier: "urn:li:userGeneratedContent",
//                 },
//               ],
//             },
//           }),
//         }
//       );

//       const registerData = await registerRes.json();

//       if (!registerRes.ok) {
//         throw new Error(
//           `Failed to register image upload: ${
//             registerData.message || registerRes.statusText
//           }`
//         );
//       }

//       const uploadUrl =
//         registerData.value.uploadMechanism[
//           "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
//         ].uploadUrl;
//       imageUrn = registerData.value.asset;

//       // Step 2: Upload image
//       const buffer = Buffer.from(imageBase64, "base64");
//       const uploadRes = await fetch(uploadUrl, {
//         method: "PUT",
//         headers: { Authorization: `Bearer ${accessToken}` },
//         body: buffer,
//       });

//       if (!uploadRes.ok) {
//         throw new Error(`Failed to upload image: ${uploadRes.statusText}`);
//       }

//       //console.log("✅ Image uploaded:", imageUrn);
//     }

//     // 📝 Step 3: Publish post
//     const postBody = {
//       author: authorUrn,
//       lifecycleState: "PUBLISHED",
//       specificContent: {
//         "com.linkedin.ugc.ShareContent": {
//           shareCommentary: { text: formattedPost },
//           shareMediaCategory: imageUrn ? "IMAGE" : "NONE",
//           media: imageUrn ? [{ status: "READY", media: imageUrn }] : [],
//         },
//       },
//       visibility: {
//         "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
//       },
//     };

//     // ✅ Now create the LinkedIn post
//     const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         "Content-Type": "application/json",
//         "X-Restli-Protocol-Version": "2.0.0",
//       },
//       body: JSON.stringify(postBody),
//     });

//     if (!postRes.ok) {
//       const error = await postRes.json();
//       throw new Error(error.message || "Failed to publish to LinkedIn");
//     }

//     const data = await postRes.json();
//     console.log("✅ LinkedIn post created:", data);

//     return { success: true, postId: data.id };
//   } catch (error) {
//     console.error("🚨 LinkedIn publishing error:", error);
//     return { success: false, error: error.message };
//   }
// }

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
