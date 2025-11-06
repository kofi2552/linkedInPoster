"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Zap } from "lucide-react";

export function GeneratePostButton({ scheduleId, topicId, onPostGenerated }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId, topicId }),
      });

      if (!response.ok) throw new Error("Failed to generate post");
      const data = await response.json();
      onPostGenerated(data);
    } catch (err) {
      setError(err.message || "Failed to generate post");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleGenerate}
        disabled={isLoading}
        variant="outline"
        className="w-full bg-transparent cursor-pointer"
      >
        {isLoading ? (
          <>
            <Spinner className="w-4 h-4 mr-2" />
            Generating...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 mr-2" />
            Generate Post
          </>
        )}
      </Button>
      {error && <div className="text-sm text-destructive">{error}</div>}
    </div>
  );
}
