"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { ChevronDown, ChevronUp } from "lucide-react"
import { ScheduleForm } from "./schedule-form"

export function TopicCard({ topic, onScheduleCreated }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{topic.title}</h3>
          {topic.description && <p className="text-sm text-muted-foreground mt-1">{topic.description}</p>}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-muted rounded"
          aria-label="Toggle schedule form"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && <ScheduleForm topicId={topic.id} onScheduleCreated={onScheduleCreated} />}
    </Card>
  )
}
