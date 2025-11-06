import { Schedule } from "@/lib/models.js"

export async function DELETE(request, { params }) {
  try {
    const { id } = params

    const schedule = await Schedule.findByPk(id)
    if (!schedule) {
      return Response.json({ error: "Schedule not found" }, { status: 404 })
    }

    await schedule.destroy()

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error deleting schedule:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
