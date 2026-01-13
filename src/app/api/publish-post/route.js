import { User, ScheduledPost, Schedule, Topic, SocialAccount } from "@/lib/models.js";
// import { publishToLinkedIn } from "@/lib/linkedin.js"; // Deprecated
import { generateSocialPost } from "@/lib/gemini.js";
import { getPlatform } from "@/lib/platforms/index.js";
import sequelize from "@/lib/db.js";

// const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

// export async function publishDuePosts() {
//   const now = new Date();
//   console.log("🕒 Cron job started:", now.toISOString());

//   const transaction = await sequelize.transaction();

//   try {
//     // Fetch all active schedules with topic and user
//     const schedules = await Schedule.findAll({
//       where: { isActive: true },
//       include: [
//         {
//           model: Topic,
//           include: [User],
//         },
//       ],
//       transaction,
//     });

//     if (!schedules.length) {
//       console.log("⚠️ No active schedules found.");
//       await transaction.commit();
//       return;
//     }

//     console.log(`Found ${schedules.length} active schedules.`);

//     for (const schedule of schedules) {
//       const topic = schedule.Topic;
//       const user = topic?.User;
//       if (!user || !user.linkedinAccessToken) continue;

//       //console.log("post creator :", user);

//       const PostUserId = user.linkedinProfileId; // ✅ LinkedIn author ID
//       const PostUserEmail = user.email; // ✅ LinkedIn author ID
//       const [hours, minutes] = schedule.scheduledTime.split(":").map(Number);

//       const scheduledDate = new Date();
//       scheduledDate.setHours(hours, minutes, 0, 0);

//       const windowMs = 5 * 60 * 1000;
//       const timeDiff = now - scheduledDate;
//       const lastGenerated = schedule.lastGeneratedAt || new Date(0);

//       let shouldPost = false;
//       if (schedule.frequency === "daily") {
//         shouldPost =
//           timeDiff >= 0 &&
//           timeDiff <= windowMs &&
//           lastGenerated < scheduledDate;
//       } else if (schedule.frequency === "weekly") {
//         shouldPost =
//           now.getDay() === schedule.dayOfWeek &&
//           timeDiff >= 0 &&
//           timeDiff <= windowMs &&
//           lastGenerated < scheduledDate;
//       } else if (schedule.frequency === "monthly") {
//         shouldPost =
//           now.getDate() === scheduledDate.getDate() &&
//           timeDiff >= 0 &&
//           timeDiff <= windowMs &&
//           lastGenerated < scheduledDate;
//       }

//       if (!shouldPost) continue;

//       console.log(`🧠 Generating post for topic "${topic.title}" on ${schedule.platform}...`);

//       const innerTx = await sequelize.transaction();

//       try {
//         // 1️⃣ Generate content
//         const contentResponse = await generateSocialPost(
//           topic.title,
//           topic.description || "Write a professional post related to this topic.",
//           {}, // userPersona could be passed if fetched
//           schedule.platform || "linkedin"
//         );
//         const content = contentResponse.post || contentResponse;

//         // 2️⃣ Get Platform Instance
//         const platformName = schedule.platform || "linkedin";
//         const platform = getPlatform(platformName);
        
//         // 3️⃣ Get Credentials
//         let accessToken, platformUserId;
//         const socialAccount = await SocialAccount.findOne({
//             where: { userId: user.id, platform: platformName, isActive: true },
//             transaction: innerTx 
//         });

//         if (socialAccount) {
//             accessToken = socialAccount.accessToken;
//             platformUserId = socialAccount.platformUserId;
//         } else if (platformName === "linkedin" && user.linkedinAccessToken) {
//             // Legacy fallback
//             accessToken = user.linkedinAccessToken;
//             platformUserId = user.linkedinProfileId;
//         }

//         if (!accessToken) {
//             console.warn(`Skipping ${platformName} post for user ${user.id} - no credentials found.`);
//             await innerTx.rollback();
//             continue;
//         }

//         // 4️⃣ Publish
//         console.log(`🚀 Publishing to ${platformName}...`);
//         const result = await platform.publishPost(
//           accessToken,
//           content,
//           platformUserId
//         );

//         // 5️⃣ Record result
//         if (result.success) {
//           await ScheduledPost.create(
//             {
//               scheduleId: schedule.id,
//               topicId: topic.id,
//               content: content,
//               scheduledFor: scheduledDate,
//               isActive: false,
//               status: "published",
//               publishedAt: now,
//               externalPostId: result.postId,
//               linkedinPostId: platformName === 'linkedin' ? result.postId : null,
//               platform: platformName,
//               userId: user.id,
//             },
//             { transaction: innerTx }
//           );

//           await schedule.update(
//             { lastGeneratedAt: now },
//             { transaction: innerTx }
//           );

//           await innerTx.commit();
//           console.log(`✅ Posted successfully for "${topic.title}" on ${platformName}`);
//         } else {
//           await innerTx.rollback();
//           console.warn(`❌ Failed to publish for "${topic.title}": ${result.error}`);
//         }
//       } catch (err) {
//         await innerTx.rollback();
//         console.error(`🚨 Error processing "${topic.title}":`, err);
//       }
//     }

//     await transaction.commit();
//     console.log("🎯 Finished checking schedules.");
//   } catch (error) {
//     await transaction.rollback();
//     console.error("Error in publishDuePosts:", error);
//   }
// }

// // ✅ Next.js App Router style handler
// export async function GET(req) {
//   const authHeader = req.headers.get("authorization");

//   if (authHeader !== `Bearer ${process.env.POST_API_TOKEN}`) {
//     return new Response(
//       JSON.stringify({ error: "Unauthorized — invalid or missing token" }),
//       { status: 401 }
//     );
//   }

//   await publishDuePosts();
//   return new Response(JSON.stringify({ success: true }), { status: 200 });
// }
