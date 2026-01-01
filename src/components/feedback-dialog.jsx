"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { MessageSquarePlus, Send } from "lucide-react";

export function FeedbackDialog({ isOpen, onClose }) {
    const [type, setType] = useState("suggestion");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim()) {
            toast.error("Please enter some feedback.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, content }),
            });

            if (res.ok) {
                toast.success("Thank you for your feedback!");
                setContent("");
                onClose();
            } else {
                toast.error("Failed to submit feedback.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Network error.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <MessageSquarePlus className="w-6 h-6 text-blue-600" />
                    </div>
                    <DialogTitle className="text-center">Share Your Feedback</DialogTitle>
                    <DialogDescription className="text-center">
                        Help us improve PostPilot. What's on your mind?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2 flex items-center gap-2">
                        <label className="text-sm font-medium">Feedback Type</label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="suggestion">Suggestion</SelectItem>
                                <SelectItem value="issue">Report an Issue</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Message</label>
                        <Textarea
                            placeholder="Tell us what you think..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[120px] resize-none"
                        />
                    </div>
                </div>

                <DialogFooter className="sm:justify-between gap-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                    >
                        {isSubmitting ? "Sending..." : "Send Feedback"}
                        <Send className="w-4 h-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
