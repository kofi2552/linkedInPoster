"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { z } from "zod"

// Helper to get max length
const getMaxLength = (postLength) => {
  switch (postLength) {
    case "short": return 500;
    case "medium": return 1000;
    case "long": return 2000;
    default: return 500; // fallback
  }
}

export function EditPostDialog({ post, isOpen, onClose, onSave }) {
  const [content, setContent] = useState(post?.content || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const maxLength = getMaxLength(post?.Topic?.postLength || "short");

  const handleSave = async () => {
    // 🛡️ Dynamic Zod Validation
    const postSchema = z.object({
      content: z.string().min(1, { message: "Content cannot be empty" }).max(maxLength, { message: `Content must be ${maxLength} characters or less` })
    });

    const result = postSchema.safeParse({ content });

    if (!result.success) {
      setError(result.error.issues[0].message)
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
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden bg-background border-border shadow-2xl rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <DialogTitle className="text-lg font-semibold text-foreground/90">Edit Post</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted/50 w-8 h-8">
            <span className="sr-only">Close</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
          </Button>
        </div>

        {/* User Persona Header (Fake) */}
        <div className="flex items-center gap-3 px-6 pt-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            YOU
          </div>
          <div className="space-y-0.5">
            <h4 className="font-semibold text-foreground text-base">Your Profile</h4>
            <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground border border-border rounded-full px-2 py-0.5 w-fit">
              <span>Anytime</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-6 py-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What do you want to talk about?"
            className="min-h-[200px] text-lg leading-relaxed resize-none border-none shadow-none focus-visible:ring-0 p-0 placeholder:text-muted-foreground/50"
            maxLength={maxLength}
          />
          {post?.imageBase64 && (
            <div className="mt-4 rounded-lg overflow-hidden border border-border/40 relative group">
              <img src={`data:image/png;base64,${post.imageBase64}`} alt="Attached" className="w-full h-auto object-cover max-h-[300px]" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-medium text-sm">Image Editing Not Supported Yet</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Tools */}
        <div className="mt-auto border-t border-border/40 p-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="hover:bg-muted/50 p-2 rounded-full cursor-pointer transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg></span>
              <span className="hover:bg-muted/50 p-2 rounded-full cursor-pointer transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg></span>
              <span className="hover:bg-muted/50 p-2 rounded-full cursor-pointer transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" /><path d="M8.5 8.5C7 9.5 6 12 6 12s2.5 1 4-.5" /></svg></span>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-xs font-medium ${content.length > maxLength ? 'text-destructive' : 'text-muted-foreground'}`}>
                {content.length}/{maxLength}
              </span>
              <div className="h-4 w-px bg-border/50"></div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            {error && <span className="text-sm text-destructive font-medium mr-auto">{error}</span>}
            <Button variant="outline" onClick={onClose} disabled={isLoading} className="rounded-full px-6 border-border/50">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading || !content.trim()} className="rounded-full px-6 bg-primary hover:bg-primary/90 font-semibold">
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
