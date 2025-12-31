"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Linkedin,
    Heart,
    MessageSquare,
    Repeat,
    Send,
    ThumbsUp,
    Zap,
    Sparkles
} from "lucide-react";

export function DemoCard() {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(1248);

    const handleLike = () => {
        if (isLiked) {
            setLikeCount((prev) => prev - 1);
            setIsLiked(false);
        } else {
            setLikeCount((prev) => prev + 1);
            setIsLiked(true);
        }
    };

    return (
        <Card className="relative bg-white dark:bg-zinc-900 border-border p-0 overflow-hidden shadow-2xl w-full max-w-md mx-auto transition-transform duration-500 hover:scale-[1.02] hover:-rotate-1">
            {/* Mock Header */}
            <div className="p-3 border-b flex items-start justify-between bg-card/50 backdrop-blur-sm">
                <div className="flex gap-2.5">
                    <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full p-[2px]">
                            <div className="w-full h-full bg-white rounded-full p-0.5">
                                <Image
                                    src="/images/PP_logo.png"
                                    width={40}
                                    height={40}
                                    alt="Avatar"
                                    className="rounded-full"
                                />
                            </div>
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 w-3 h-3 rounded-full border-2 border-white" />
                    </div>
                    <div>
                        <div className="font-bold text-sm text-foreground">
                            Sarah Professional
                        </div>
                        <div className="text-[10px] text-muted-foreground flex items-center">
                            Thought Leader • 10h •{" "}
                            <span className="ml-[2px]">
                                <Linkedin className="w-2.5 h-2.5 text-blue-600" />
                            </span>
                        </div>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <span className="text-lg">...</span>
                </Button>
            </div>

            {/* Mock Content */}
            <div className="p-4 space-y-3">
                <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
                    <p>Stop overthinking your content strategy. 🛑</p>
                    <p>
                        Most professionals struggle with consistency because they try to write
                        every single day from scratch. That's a recipe for burnout.
                    </p>
                    <p className="font-medium text-blue-600">
                        Instead, try batching with AI.
                    </p>
                    {/* <p>
                        1. Brainstorm (Monday) 🧠<br />
                        2. Draft with AI ✍️<br />
                        3. Schedule 🗓️
                    </p>
                    <p>Consistency is key. 🚀 #ContentStrategy #Growth</p> */}
                </div>

                {/* Interactive Visual */}
                <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg relative overflow-hidden group/image cursor-pointer">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur rounded-lg p-4 shadow-lg transform transition-transform duration-500 group-hover/image:scale-110">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-md bg-blue-100 text-blue-600">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <div className="font-bold text-sm">AI Generated</div>
                            </div>
                            <div className="space-y-1.5 w-32">
                                <div className="h-1.5 bg-slate-200 rounded-full w-full" />
                                <div className="h-1.5 bg-slate-200 rounded-full w-3/4" />
                                <div className="h-1.5 bg-slate-200 rounded-full w-5/6" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive Stats */}
            <div className="px-3 py-2 flex items-center justify-between text-[10px] text-muted-foreground border-t bg-card/30">
                <div className="flex items-center gap-1">
                    <div className="flex -space-x-1">
                        <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center ring-2 ring-white">
                            <ThumbsUp className="w-2 h-2 text-white fill-current" />
                        </div>
                        <div className="w-3.5 h-3.5 rounded-full bg-red-500 flex items-center justify-center ring-2 ring-white">
                            <Heart className="w-2 h-2 text-white fill-current" />
                        </div>
                        <div className="w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center ring-2 ring-white">
                            <Zap className="w-2 h-2 text-white fill-current" />
                        </div>
                    </div>
                    <span className="ml-1 hover:underline cursor-pointer">
                        {likeCount.toLocaleString()}
                    </span>
                </div>
                <div className="hover:underline cursor-pointer">
                    42 comments • 12 reposts
                </div>
            </div>

            {/* Interactive Actions */}
            <div className="px-2 py-1 flex justify-between border-t bg-card">
                <Button
                    variant="ghost"
                    size="sm"
                    className={`flex-1 gap-1.5 h-9 transition-all duration-300 ${isLiked
                        ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                        : "text-muted-foreground hover:bg-muted"
                        }`}
                    onClick={handleLike}
                >
                    <ThumbsUp
                        className={`w-4 h-4 transition-transform duration-300 ${isLiked ? "scale-125 fill-current" : ""
                            }`}
                    />
                    <span className="font-medium text-xs">Like</span>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 gap-1.5 h-9 text-muted-foreground hover:bg-muted group/btn"
                >
                    <MessageSquare className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" />
                    <span className="font-medium text-xs">Comment</span>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 gap-1.5 h-9 text-muted-foreground hover:bg-muted group/btn"
                >
                    <Repeat className="w-4 h-4 group-hover/btn:rotate-180 transition-transform duration-500" />
                    <span className="font-medium text-xs">Repost</span>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 gap-1.5 h-9 text-muted-foreground hover:bg-muted group/btn"
                >
                    <Send className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    <span className="font-medium text-xs">Send</span>
                </Button>
            </div>
        </Card>
    );
}
