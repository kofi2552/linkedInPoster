import { generateLinkedInPost } from "@/lib/gemini.js"
import { Topic, Schedule, ScheduledPost } from "@/lib/models.js"
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
    const topic = await Topic.findByPk(topicId)
    const schedule = await Schedule.findByPk(scheduleId)

    if (!topic || !schedule) {
      return Response.json({ error: "Topic or Schedule not found" }, { status: 404 })
    }

    // Generate LinkedIn post using Gemini
    const content = await generateLinkedInPost(topic.title, topic.description)

    // Calculate next scheduled date
    const nextScheduledDate = getNextScheduledDate(schedule.frequency, schedule.scheduledTime, schedule.dayOfWeek)

    // Create scheduled post
    const scheduledPost = await ScheduledPost.create({
      scheduleId,
      topicId,
      content,
      scheduledFor: nextScheduledDate,
      status: "pending",
    })

    // Update schedule's lastGeneratedAt
    await schedule.update({ lastGeneratedAt: new Date() })

    return Response.json(scheduledPost, { status: 201 })
  } catch (error) {
    console.error("Error generating post:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
