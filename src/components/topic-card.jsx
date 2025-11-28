"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Trash, Loader2 } from "lucide-react";
import { ScheduleForm } from "./schedule-form";

export function TopicCard({ topic, onScheduleCreated, onDeleted }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setDeleting] = useState(false);

  async function handleDelete() {
    const yes = confirm(
      `Are you sure you want to delete the topic: "${topic.title}"?`
    );
    if (!yes) return;
    setDeleting(true);
    const res = await fetch(`/api/topics/${topic.id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (res.ok) {
      setDeleting(false);
      onDeleted?.(topic.id); // Tell parent to refresh/remove topic
    } else {
      setDeleting(false);
      alert("Failed to delete: " + data.error);
    }
  }

  return (
    <Card className="p-6 space-y-4 relative">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{topic.title}</h3>
          {topic.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {topic.description}
            </p>
          )}
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-muted rounded"
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="ml-3 p-1 text-red-500 hover:bg-red-100 rounded"
          aria-label="Delete topic"
        >
          {isDeleting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Trash className="w-5 h-5" />
          )}
        </button>
      </div>

      {isExpanded && (
        <ScheduleForm
          topicId={topic.id}
          onScheduleCreated={onScheduleCreated}
        />
      )}
    </Card>
  );
}
