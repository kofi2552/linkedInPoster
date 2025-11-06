"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/ui/spinner"
import { format } from "date-fns"
import { Trash2 } from "lucide-react"

export function ScheduleList({ topicId, refreshTrigger, onScheduleToggled, onScheduleDeleted }) {
  const [schedules, setSchedules] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [togglingId, setTogglingId] = useState(null)

  useEffect(() => {
    fetchSchedules()
  }, [topicId, refreshTrigger])

  const fetchSchedules = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/schedules?topicId=${topicId}`)
      if (!response.ok) throw new Error("Failed to fetch schedules")
      const data = await response.json()
      setSchedules(data)
    } catch (err) {
      setError(err.message || "Failed to fetch schedules")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = async (schedule) => {
    setTogglingId(schedule.id)

    try {
      const response = await fetch("/api/schedules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: schedule.id,
          isActive: !schedule.isActive,
        }),
      })

      if (!response.ok) throw new Error("Failed to update schedule")
      const data = await response.json()
      setSchedules(schedules.map((s) => (s.id === schedule.id ? data : s)))
      onScheduleToggled(data)
    } catch (err) {
      setError(err.message || "Failed to update schedule")
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (scheduleId) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return

    try {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete schedule")
      setSchedules(schedules.filter((s) => s.id !== scheduleId))
      onScheduleDeleted(scheduleId)
    } catch (err) {
      setError(err.message || "Failed to delete schedule")
    }
  }

  const getFrequencyLabel = (frequency, dayOfWeek) => {
    if (frequency === "weekly") {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      return `Weekly on ${days[dayOfWeek]}`
    }
    return frequency.charAt(0).toUpperCase() + frequency.slice(1)
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-20">
          <Spinner className="w-5 h-5" />
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-destructive">
          <p>{error}</p>
          <Button onClick={fetchSchedules} variant="outline" className="mt-4 bg-transparent">
            Retry
          </Button>
        </div>
      </Card>
    )
  }

  if (schedules.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <p>No schedules created yet</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {schedules.map((schedule) => (
        <Card key={schedule.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={schedule.isActive ? "default" : "secondary"}>
                  {schedule.isActive ? "Active" : "Inactive"}
                </Badge>
                <span className="text-sm font-medium">{getFrequencyLabel(schedule.frequency, schedule.dayOfWeek)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Scheduled for {format(new Date(`2024-01-01T${schedule.scheduledTime}`), "HH:mm")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={schedule.isActive}
                onCheckedChange={() => handleToggle(schedule)}
                disabled={togglingId === schedule.id}
              />
              <Button
                onClick={() => handleDelete(schedule.id)}
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
