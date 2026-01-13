import { generateSocialPost, generateLinkedInPost } from "@/lib/gemini.js"
import { generateImage } from "@/lib/image.js"
import { Topic, Schedule, ScheduledPost, User } from "@/lib/models.js"
import { addDays, addMonths, setHours, setMinutes, startOfDay } from "date-fns"

// ... (helper functions remain same)

export async function POST(request) {
  try {
    const { scheduleId, topicId } = await request.json()
    // ... validation ...

    const topic = await Topic.findByPk(topicId, {
      include: [{ model: Schedule }, { model: User, attributes: ['profession', 'industry', 'tone', 'bio'] }]
    });

    const schedule = await Schedule.findByPk(scheduleId);

    if (!topic || !schedule) {
      return Response.json({ error: "Topic or Schedule not found" }, { status: 404 })
    }

    const userPersona = topic.User ? {
      profession: topic.User.profession,
      industry: topic.User.industry,
      tone: topic.User.tone,
      bio: topic.User.bio
    } : {};

    // Generate Post using Gemini with platform context
    const content = await generateSocialPost(
      topic.title,
      topic.description,
      userPersona,
      schedule.platform || "linkedin"
    )

    let imageBase64 = null;
    if (topic.includeImage) {
      try {
        console.log("Generating image for topic:", topic.title);
        // Use Gemini to create an image prompt based on the topic
        const imagePrompt = `Generate a prompt for an AI image generator to create a professional LinkedIn post image about: "${topic.title}". The image should be realistic, clean, and conceptually engaging. No text in the image. Return only the prompt string.`;

        const promptResponse = await generateLinkedInPost(imagePrompt, "Keep it under 200 characters, descriptive but concise.");
        const finalPrompt = promptResponse.post || `${topic.title} professional linkedin image, clean, hyper-realistic,  modern, 4k`;

        console.log("Image Prompt:", finalPrompt);
        imageBase64 = await generateImage(finalPrompt);
      } catch (imgError) {
        console.error("Failed to generate image:", imgError);
        // We continue without image if generation fails
      }
    }

    // Calculate next scheduled date
    const nextScheduledDate = getNextScheduledDate(schedule.frequency, schedule.scheduledTime, schedule.dayOfWeek)

    // Create scheduled post
    const scheduledPost = await ScheduledPost.create({
      scheduleId,
      topicId,
      content: content.post || content, // Handle object or string return
      scheduledFor: nextScheduledDate,
      status: "pending",
      imageBase64: imageBase64,
      platform: schedule.platform || "linkedin"
    })

    // Update schedule's lastGeneratedAt
    await schedule.update({ lastGeneratedAt: new Date() })

    return Response.json(scheduledPost, { status: 201 })
  } catch (error) {
    console.error("Error generating post:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
