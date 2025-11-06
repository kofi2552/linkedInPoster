"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Send } from "lucide-react"

export function PublishButton({ postId, userId, onPublished }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handlePublish = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/publish-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to publish post")
      }

      const data = await response.json()
      onPublished(data)
    } catch (err) {
      setError(err.message || "Failed to publish post")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handlePublish} disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Spinner className="w-4 h-4 mr-2" />
            Publishing...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Publish Now
          </>
        )}
      </Button>
      {error && <div className="text-sm text-destructive">{error}</div>}
    </div>
  )
}
