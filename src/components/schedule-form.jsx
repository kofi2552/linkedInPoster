"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "next-auth/react";

export function ScheduleForm({ topicId, onScheduleCreated }) {
  const [frequency, setFrequency] = useState("daily");
  const [time, setTime] = useState("09:00");
  const [dayOfWeek, setDayOfWeek] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { data: session } = useSession();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user.id,
          topicId,
          frequency,
          scheduledTime: time,
          dayOfWeek: frequency === "weekly" ? Number.parseInt(dayOfWeek) : null,
        }),
      });

      if (!response.ok) throw new Error("Failed to create schedule");
      const data = await response.json();
      onScheduleCreated(data);
      setFrequency("daily");
      setTime("09:00");
      setDayOfWeek("0");
      toast({
        title: "Schedule Created",
        description: "The schedule has been created successfully.",
      });
    } catch (err) {
      setError(err.message || "Failed to create schedule");
      toast({
        title: "Schedule Failed",
        description: "Failed to create schedule.",
      });
      console.error("Error creating schedule:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main row */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Frequency */}
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Frequency</label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="bg-background w-full cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time */}
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Time</label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-background w-full cursor-pointer"
            />
          </div>

          {/* Submit */}
          <div className="flex-1 md:flex-none">
            <label className="text-sm font-medium">Save Schedule</label>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary/90 hover:bg-primary cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Creating Schedule...
                </>
              ) : (
                "Create Schedule"
              )}
            </Button>
          </div>
        </div>

        {/* Weekly extra field */}
        {frequency === "weekly" && (
          <div className="space-y-2 animate-in slide-in-from-top-2">
            <label className="text-sm font-medium">Day of Week</label>
            <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
              <SelectTrigger className="bg-background w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Sunday</SelectItem>
                <SelectItem value="1">Monday</SelectItem>
                <SelectItem value="2">Tuesday</SelectItem>
                <SelectItem value="3">Wednesday</SelectItem>
                <SelectItem value="4">Thursday</SelectItem>
                <SelectItem value="5">Friday</SelectItem>
                <SelectItem value="6">Saturday</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-sm text-destructive font-medium">
            {error}
          </div>
        )}
      </form>

    </div>
  );
}
