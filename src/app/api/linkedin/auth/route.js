const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI =
  process.env.LINKEDIN_REDIRECT_URI ||
  `${process.env.NEXT_PUBLIC_APP_URL}/api/linkedin/callback`;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    console.log("LinkedIn auth request for userId:", userId);

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    // Generate LinkedIn authorization URL
    const scope = "w_member_social openid email profile";
    const state = Buffer.from(JSON.stringify({ userId })).toString("base64");

    const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("client_id", LINKEDIN_CLIENT_ID);
    authUrl.searchParams.append("redirect_uri", LINKEDIN_REDIRECT_URI);
    authUrl.searchParams.append("scope", scope);
    authUrl.searchParams.append("state", state);

    console.log("Generated LinkedIn auth URL:", authUrl.toString());

    return Response.json({ authUrl: authUrl.toString() });
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
