"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Trash2, Loader2, CalendarClock, Activity, Calendar, Pencil, Check, X } from "lucide-react";
import { ScheduleForm } from "./schedule-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input"; // Import Input
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import { format } from "date-fns";

export function TopicCard({ topic, onScheduleCreated, onDeleted, isLinkedInConnected }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // New State
  const [editTitle, setEditTitle] = useState(topic.title); // New State
  const [editDescription, setEditDescription] = useState(topic.description); // New State
  const { toast } = useToast();

  const activeSchedule = topic.Schedules?.[0]; // Assuming one schedule for now

  async function handleDelete(e) {
    if (e) e.stopPropagation();

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
      toast({
        title: "Topic Deleted",
        description: "The topic has been removed successfully.",
      });
    } else {
      setDeleting(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: data.error || "Failed to delete topic",
      });
    }
  }

  async function handleSave(e) {
    if (e) e.stopPropagation();

    try {
      const res = await fetch(`/api/topics/${topic.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription
        })
      });

      if (res.ok) {
        toast({ title: "Topic Updated", description: "Changes saved successfully." });
        setIsEditing(false);
        // Ideally we should update the parent state or re-fetch, but for now we can rely on local state 
        // update if we were passing a setTopic prop, but here we might need to assume the parent refreshes 
        // or we just update the local display values by mutating the prop (bad practice) or just rely on the inputs.
        // Actually, best practice: tell parent to refresh.
        // But since 'topic' prop is fixed, we should probably stick to `editTitle` for display if not editing?
        // A quick fix: force a window reload or better, use a callback if provided.
        // For this task, I'll update the 'topic' object locally by modifying the prop object (shallow) 
        // so it reflects immediately without full reload if the parent doesn't re-render.
        topic.title = editTitle;
        topic.description = editDescription;
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not save changes." });
    }
  }

  function toggleEdit(e) {
    if (e) e.stopPropagation();
    setIsEditing(!isEditing);
    if (!isEditing) {
      // Reset to current values when opening edit
      setEditTitle(topic.title);
      setEditDescription(topic.description);
    }
  }

  function getScheduleSummary() {
    if (!activeSchedule) return "No automated schedule";
    if (!activeSchedule.isActive) return "Schedule paused";

    const time = activeSchedule.scheduledTime?.slice(0, 5);
    const freq = activeSchedule.frequency;

    if (freq === "daily") return `Daily at ${time}`;
    if (freq === "weekly") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const day = days[activeSchedule.dayOfWeek] || "";
      return `Weekly on ${day} at ${time}`;
    }
    return `${freq} schedule`;
  }

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 border-border/50 hover:border-primary/20 hover:shadow-lg ${isExpanded ? 'ring-2 ring-primary/5 bg-card' : 'bg-card/50'}`}
    >
      {/* Status Strip */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 transition-colors duration-300 ${activeSchedule?.isActive ? "bg-green-500" : "bg-muted"}`}
      />

      <div
        className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 pl-8 cursor-pointer gap-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            {isEditing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="font-semibold text-lg max-w-md h-9"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <h3 className="text-xl font-semibold tracking-tight text-foreground/90 group-hover:text-primary transition-colors">
                {topic.title}
              </h3>
            )}

            {!isEditing && (
              activeSchedule?.isActive ? (
                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 text-[10px] px-2 h-5">
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-muted-foreground text-[10px] px-2 h-5">
                  Draft
                </Badge>
              )
            )}
          </div>

          {(isEditing || topic.description) && (
            isEditing ? (
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="text-sm max-w-xl"
                placeholder="Topic description..."
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <p className="text-sm text-foreground/60 leading-relaxed max-w-2xl line-clamp-2">
                {topic.description}
              </p>
            )
          )}

          {/* Metadata Bar - Visible when collapsed/expanded */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              Created {format(new Date(topic.createdAt), "MMM d, yyyy")}
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className={`flex items-center gap-1.5 text-xs font-medium ${activeSchedule?.isActive ? "text-primary placeholder:opacity-50" : "text-muted-foreground"}`}>
              <Activity className="w-3.5 h-3.5" />
              {getScheduleSummary()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                className="text-green-600 hover:text-green-700 hover:bg-green-100 transition-colors z-10"
              >
                <Check className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleEdit}
                className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleEdit}
                className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors z-10"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors z-10"
                aria-label="Delete topic"
              >
                {isDeleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </Button>
            </>
          )}

          <div className={`p-2 rounded-full bg-muted/50 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-primary/10 text-primary' : ''}`}>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
      >
        <div className="overflow-hidden">
          <div className="p-6 pt-0 border-t border-border/30 bg-muted/5">
            <div className="flex items-center gap-2 mb-6 mt-6 text-sm font-semibold text-primary">
              <CalendarClock className="w-4 h-4" />
              {activeSchedule ? "Manage Schedule" : "Setup Automated Schedule"}
            </div>
            {isLinkedInConnected ? (
              <ScheduleForm
                topicId={topic.id}
                onScheduleCreated={(s) => {
                  onScheduleCreated(s);
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-destructive/20 bg-destructive/5 rounded-xl text-center space-y-3">
                <div className="p-3 bg-white rounded-full shadow-sm">
                  <Loader2 className="w-6 h-6 text-destructive animate-pulse" />
                </div>
                <h4 className="font-semibold text-destructive">LinkedIn Connection Required</h4>
                <p className="text-sm text-muted-foreground max-w-sm">
                  You need to connect your LinkedIn account before you can schedule posts for this topic.
                </p>
                <Button
                  onClick={() => window.location.href = "/connect"}
                  className="bg-destructive hover:bg-destructive/90 text-white shadow-sm mt-2"
                >
                  Connect Now
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
