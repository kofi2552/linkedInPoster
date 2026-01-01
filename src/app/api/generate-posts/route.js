import { generateLinkedInPost } from "@/lib/gemini.js"
import { generateImage } from "@/lib/image.js"
import { Topic, Schedule, ScheduledPost, User } from "@/lib/models.js"
import { addDays, addMonths, setHours, setMinutes, startOfDay } from "date-fns"

function getNextScheduledDate(frequency, time, dayOfWeek = null) {
  const [hours, minutes] = time.split(":").map(Number)
  let nextDate = startOfDay(new Date())
  nextDate = setHours(nextDate, hours)
  nextDate = setMinutes(nextDate, minutes)

  // If the time has already passed today, start from tomorrow
  if (nextDate <= new Date()) {
    nextDate = addDays(nextDate, 1)
  }

  if (frequency === "daily") {
    return nextDate
  } else if (frequency === "weekly") {
    const targetDay = dayOfWeek || 0
    const currentDay = nextDate.getDay()
    let daysToAdd = targetDay - currentDay

    if (daysToAdd <= 0) {
      daysToAdd += 7
    }

    return addDays(nextDate, daysToAdd)
  } else if (frequency === "monthly") {
    return addMonths(nextDate, 1)
  }

  return nextDate
}

export async function POST(request) {
  try {
    const { scheduleId, topicId } = await request.json()

    if (!scheduleId || !topicId) {
      return Response.json({ error: "scheduleId and topicId are required" }, { status: 400 })
    }

    // Fetch topic and schedule
    // Fetch topic and schedule with User to get Persona
    const topic = await Topic.findByPk(topicId, {
      include: [{ model: Schedule }, { model: User, attributes: ['profession', 'industry', 'tone', 'bio'] }]
    });

    // Fallback if topic/schedule not found or if scheduleId doesn't match
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

    // Generate LinkedIn post using Gemini
    const content = await generateLinkedInPost(topic.title, topic.description, userPersona)

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
      imageBase64: imageBase64
    })

    // Update schedule's lastGeneratedAt
    await schedule.update({ lastGeneratedAt: new Date() })

    return Response.json(scheduledPost, { status: 201 })
  } catch (error) {
    console.error("Error generating post:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
