// import { Op } from "sequelize";
// import { ScheduledPost, User } from "@/lib/models.js";
// import { publishToLinkedIn } from "@/lib/linkedin.js";

// export async function GET() {
//   const now = new Date();

//   try {
//     // Get all users in the system
//     const users = await User.findAll();

//     if (!users || users.length === 0) {
//       console.log("⚠️ No users found in the system.");
//       return;
//     }

//     console.log(`👥 Checking due posts for ${users.length} users...`);

//     for (const user of users) {
//       // Skip users who have not connected LinkedIn
//       if (!user.linkedinAccessToken) {
//         console.warn(`⏭️ Skipping user ${user.id} - no LinkedIn token`);
//         continue;
//       }

//       // Find all of this user's pending posts that are due now or earlier
//       const duePosts = await ScheduledPost.findAll({
//         where: {
//           userId: user.id,
//           status: "pending",
//           publishDate: { [Op.lte]: now },
//         },
//       });

//       if (duePosts.length === 0) {
//         console.log(`🕓 No due posts for user ${user.id}`);
//         continue;
//       }

//       console.log(
//         `📬 Found ${duePosts.length} due post(s) for user ${user.id}`
//       );

//       // Publish all due posts for this user
//       for (const post of duePosts) {
//         try {
//           const result = await publishToLinkedIn(
//             user.linkedinAccessToken,
//             post.content
//           );

//           if (result.success) {
//             await post.update({
//               isActive: true,
//               status: "published",
//               publishedAt: now,
//               linkedinPostId: result.postId,
//             });
//             console.log(`✅ Published post ${post.id} for user ${user.id}`);
//           } else {
//             await post.update({ status: "failed" });
//             console.warn(
//               `❌ Failed to publish post ${post.id} for user ${user.id}: ${result.error}`
//             );
//           }
//         } catch (err) {
//           console.error(
//             `🚨 Error publishing post ${post.id} for user ${user.id}:`,
//             err
//           );
//           await post.update({ status: "failed" });
//         }
//       }
//     }

//     console.log("🎉 Finished checking and publishing due posts.");
//   } catch (error) {
//     console.error("Error publishing post:", error);
//     return Response.json({ error: error.message }, { status: 500 });
//   }
// }

// export async function POST(request) {
//   try {
//     const { postId, userId } = await request.json()

//     if (!postId || !userId) {
//       return Response.json({ error: "postId and userId are required" }, { status: 400 })
//     }

//     // Fetch post and user
//     const post = await ScheduledPost.findByPk(postId)
//     const user = await User.findByPk(userId)

//     const now = new Date();

//     // Find all pending posts that should be published now
//     const duePosts = await db.ScheduledPost.findAll({
//       where: {
//         status: "pending",
//         publishDate: { [db.Sequelize.Op.lte]: now },
//       },
//     });

//     if (duePosts.length === 0) {
//       return NextResponse.json({ message: "No posts to publish" });
//     }

//     // Publish each
//     for (const post of duePosts) {
//       await post.update({
//         isActive: true,
//         status: "published",
//         publishedAt: now,
//       });
//     }

//     if (!post || !user) {
//       return Response.json({ error: "Post or User not found" }, { status: 404 })
//     }

//     if (!user.linkedinAccessToken) {
//       return Response.json({ error: "LinkedIn not connected" }, { status: 401 })
//     }

//     // Publish to LinkedIn
//     const result = await publishToLinkedIn(user.linkedinAccessToken, post.content)

//     if (!result.success) {
//       // Update post status to failed
//       await post.update({
//         status: "failed",
//       })

//       return Response.json({ error: result.error }, { status: 500 })
//     }

//     // Update post status to published
//     await post.update({
//       status: "published",
//       publishedAt: new Date(),
//       linkedinPostId: result.postId,
//     })

//     return Response.json(post)
//   } catch (error) {
//     console.error("Error publishing post:", error)
//     return Response.json({ error: error.message }, { status: 500 })
//   }
// }

// dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

// export async function publishDuePosts() {
//   const now = new Date();
//   console.log("🕒 Cron job started:", now.toISOString());

//   try {
//     const users = await User.findAll();
//     if (!users.length) {
//       console.log("⚠️ No users found");
//       return;
//     }

//     console.log(`👥 Checking posts for ${users.length} users...`);

//     for (const user of users) {
//       if (!user.linkedinAccessToken) {
//         console.log(`⏭️ Skipping user ${user.id} — no LinkedIn token`);
//         continue;
//       }

//       const PostUserId = user?.linkedinProfileId;

//       const duePosts = await ScheduledPost.findAll({
//         where: {
//           userId: user.id,
//           status: "pending",
//           scheduledFor: { [Op.lte]: now },
//         },
//       });

//       if (!duePosts.length) continue;

//       for (const post of duePosts) {
//         try {
//           // const result = await publishToLinkedIn(accessToken, post.content);
//           const result = await publishToLinkedIn(
//             accessToken,
//             post.content,
//             PostUserId
//           );

//           if (result.success) {
//             await post.update({
//               isActive: true,
//               status: "published",
//               publishedAt: now,
//               linkedinPostId: result.postId,
//             });
//             console.log(`✅ Published post ${post.id} for user ${user.id}`);
//           } else {
//             await post.update({ status: "failed" });
//             console.warn(`❌ Failed post ${post.id}: ${result.error}`);
//           }
//         } catch (err) {
//           await post.update({ status: "failed" });
//           console.error(`🚨 Error posting ${post.id}:`, err);
//         }
//       }
//     }

//     console.log("🎉 Finished checking and publishing due posts.");
//   } catch (error) {
//     console.error("Error publishing posts:", error);
//   }
// }

// 🔹 Keep this so Vercel can still call it via /api/cron/publishScheduledPosts
// export async function GET() {
//   await publishDuePosts();
//   return Response.json({ success: true });
// }

import { User, ScheduledPost, Schedule, Topic } from "@/lib/models.js";
import { publishToLinkedIn } from "@/lib/linkedin.js";
import { generateLinkedInPost } from "@/lib/gemini.js";

// export async function publishDuePosts() {
//   const now = new Date();
//   console.log("🕒 Cron job started:", now.toISOString());

//   try {
//     // 1️⃣ Fetch all active schedules with their topic and user
//     const schedules = await Schedule.findAll({
//       where: { isActive: true },
//       include: [
//         {
//           model: Topic,
//           include: [User],
//         },
//       ],
//     });

//     if (!schedules.length) {
//       console.log("⚠️ No active schedules found.");
//       return;
//     }

//     for (const schedule of schedules) {
//       const topic = schedule.Topic;
//       const user = topic?.User;
//       if (!user || !user.linkedinAccessToken) continue;

//       const scheduledTime = schedule.scheduledTime; // e.g. "09:00:00"
//       const [hours, minutes] = scheduledTime.split(":").map(Number);
//       const scheduledDate = new Date(now);
//       scheduledDate.setHours(hours, minutes, 0, 0);

//       const lastGenerated = schedule.lastGeneratedAt || new Date(0);

//       // 2️⃣ Determine if it's time to post
//       let shouldPost = false;

//       if (schedule.frequency === "daily") {
//         shouldPost =
//           now >= scheduledDate &&
//           (!lastGenerated ||
//             lastGenerated.toDateString() !== now.toDateString());
//       } else if (schedule.frequency === "weekly") {
//         shouldPost =
//           now.getDay() === schedule.dayOfWeek &&
//           now >= scheduledDate &&
//           (!lastGenerated ||
//             lastGenerated.toDateString() !== now.toDateString());
//       } else if (schedule.frequency === "monthly") {
//         shouldPost =
//           now.getDate() === new Date(lastGenerated).getDate() &&
//           now >= scheduledDate &&
//           (!lastGenerated || lastGenerated.getMonth() !== now.getMonth());
//       }

//       if (!shouldPost) continue;

//       console.log(`🧠 Generating post for topic "${topic.title}"...`);

//       try {
//         // 3️⃣ Generate post content
//         const content = await generateLinkedInPost(
//           topic.title,
//           topic.description ||
//             "Write a professional, engaging LinkedIn post related to this topic."
//         );

//         // 4️⃣ Publish to LinkedIn
//         const result = await publishToLinkedIn(
//           user.linkedinAccessToken,
//           content,
//           user.linkedinProfileId
//         );

//         if (result.success) {
//           // 5️⃣ Record the post in ScheduledPost
//           await ScheduledPost.create({
//             scheduleId: schedule.id,
//             topicId: topic.id,
//             content,
//             scheduledFor: scheduledDate,
//             isActive: false,
//             status: "published",
//             publishedAt: now,
//             linkedinPostId: result.postId,
//           });

//           // 6️⃣ Update lastGeneratedAt
//           await schedule.update({ lastGeneratedAt: now });

//           console.log(`✅ Posted successfully for topic "${topic.title}"`);
//         } else {
//           console.warn(
//             `❌ Failed to publish for topic "${topic.title}": ${result.error}`
//           );
//         }
//       } catch (err) {
//         console.error(
//           `🚨 Error generating/publishing for topic "${topic.title}":`,
//           err
//         );
//       }
//     }

//     console.log("🎯 Finished checking schedules.");
//   } catch (error) {
//     console.error("Error in publishDuePosts:", error);
//   }
// }

// Route handler (so Vercel cron can trigger it)

export async function publishDuePosts() {
  const now = new Date();
  console.log("🕒 Cron job started:", now.toISOString());

  try {
    // 1️⃣ Fetch all active schedules with their topic and user
    const schedules = await Schedule.findAll({
      where: { isActive: true },
      include: [
        {
          model: Topic,
          include: [User],
        },
      ],
    });

    if (!schedules.length) {
      console.log("⚠️ No active schedules found.");
      return;
    }

    for (const schedule of schedules) {
      const topic = schedule.Topic;
      const user = topic?.User;
      if (!user || !user.linkedinAccessToken) continue;

      const [hours, minutes] = schedule.scheduledTime.split(":").map(Number);

      // Make a Date object for today's scheduled time
      const scheduledDate = new Date();
      scheduledDate.setHours(hours, minutes, 0, 0);

      // 5-minute tolerance window
      const windowMs = 5 * 60 * 1000;
      const timeDiff = now - scheduledDate;

      const lastGenerated = schedule.lastGeneratedAt || new Date(0);

      let shouldPost = false;

      if (schedule.frequency === "daily") {
        shouldPost =
          timeDiff >= 0 &&
          timeDiff <= windowMs &&
          lastGenerated < scheduledDate;
      } else if (schedule.frequency === "weekly") {
        shouldPost =
          now.getDay() === schedule.dayOfWeek &&
          timeDiff >= 0 &&
          timeDiff <= windowMs &&
          lastGenerated < scheduledDate;
      } else if (schedule.frequency === "monthly") {
        shouldPost =
          now.getDate() === scheduledDate.getDate() &&
          timeDiff >= 0 &&
          timeDiff <= windowMs &&
          lastGenerated < scheduledDate;
      }

      if (!shouldPost) continue;

      console.log(`🧠 Generating post for topic "${topic.title}"...`);

      try {
        const content = await generateLinkedInPost(
          topic.title,
          topic.description ||
            "Write a professional, engaging LinkedIn post related to this topic."
        );

        const result = await publishToLinkedIn(
          user.linkedinAccessToken,
          content,
          user.linkedinProfileId
        );

        if (result.success) {
          await ScheduledPost.create({
            scheduleId: schedule.id,
            topicId: topic.id,
            content,
            scheduledFor: scheduledDate,
            isActive: false,
            status: "published",
            publishedAt: now,
            linkedinPostId: result.postId,
          });

          await schedule.update({ lastGeneratedAt: now });

          console.log(`✅ Posted successfully for topic "${topic.title}"`);
        } else {
          console.warn(
            `❌ Failed to publish for topic "${topic.title}": ${result.error}`
          );
        }
      } catch (err) {
        console.error(
          `🚨 Error generating/publishing for topic "${topic.title}":`,
          err
        );
      }
    }

    console.log("🎯 Finished checking schedules.");
  } catch (error) {
    console.error("Error in publishDuePosts:", error);
  }
}

export async function GET() {
  await publishDuePosts();
  return Response.json({ success: true });
}

// Utility: calculate next time
// function getNextScheduledTime(schedule, fromDate) {
//   const next = new Date(fromDate);
//   const [hours, minutes] = schedule.scheduledTime.split(":");

//   if (schedule.frequency === "daily") next.setDate(next.getDate() + 1);
//   else if (schedule.frequency === "weekly") next.setDate(next.getDate() + 7);
//   else if (schedule.frequency === "monthly") next.setMonth(next.getMonth() + 1);

//   next.setHours(hours, minutes, 0, 0);
//   return next;
// }
