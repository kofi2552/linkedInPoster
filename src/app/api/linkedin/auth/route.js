import { getPlatform } from "@/lib/platforms/index.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    console.log("LinkedIn auth request for userId:", userId);

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    const platform = getPlatform("linkedin");
    const authUrl = await platform.getAuthUrl(userId);

    console.log("Generated LinkedIn auth URL:", authUrl);

    return Response.json({ authUrl });
  } catch (error) {
    console.error("LinkedIn auth error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const { text } = body;

//     if (!text) {
//       return Response.json(
//         { error: "Post content is required" },
//         { status: 400 }
//       );
//     }

//     // Fetch the authenticated user (for example, your company page)
//     const profileRes = await fetch("https://api.linkedin.com/v2/me", {
//       headers: {
//         Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
//       },
//     });

//     const profile = await profileRes.json();

//     // Post content
//     const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
//         "Content-Type": "application/json",
//         "X-Restli-Protocol-Version": "2.0.0",
//       },
//       body: JSON.stringify({
//         author: `urn:li:person:${profile.id}`,
//         lifecycleState: "PUBLISHED",
//         specificContent: {
//           "com.linkedin.ugc.ShareContent": {
//             shareCommentary: { text },
//             shareMediaCategory: "NONE",
//           },
//         },
//         visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
//       }),
//     });

//     const postData = await postRes.json();
//     return Response.json(postData);
//   } catch (error) {
//     console.error("LinkedIn API error:", error);
//     return Response.json({ error: error.message }, { status: 500 });
//   }
// }
