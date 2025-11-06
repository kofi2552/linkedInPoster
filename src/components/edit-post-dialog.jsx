"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"

export function EditPostDialog({ post, isOpen, onClose, onSave }) {
  const [content, setContent] = useState(post?.content || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSave = async () => {
    if (!content.trim()) {
      setError("Content cannot be empty")
      return
    }

    if (content.length > 300) {
      setError("Content must be 300 characters or less")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/scheduled-posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: post.id,
          content,
        }),
      })

      if (!response.ok) throw new Error("Failed to update post")
      const data = await response.json()
      onSave(data)
      onClose()
    } catch (err) {
      setError(err.message || "Failed to update post")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Post Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Edit your LinkedIn post..."
              rows={5}
              maxLength={300}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{content.length}/300 characters</span>
              {content.length > 300 && <span className="text-destructive">Exceeds limit</span>}
            </div>
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline" disabled={isLoading} className="bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !content.trim()}>
            {isLoading ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
