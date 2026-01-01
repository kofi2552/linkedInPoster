"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { X, Plus, Sparkles, Type, List, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { PremiumModal } from "./premium-modal";
import { ChevronDown, Image as ImageIcon, Lock } from "lucide-react";
import { generatorSchema } from "@/lib/schemas";

export function BatchContentGenerator({ userId, onTopicsCreated, user }) {
  const [topics, setTopics] = useState([]);
  const [inputType, setInputType] = useState("text");
  const [currentTopic, setCurrentTopic] = useState("");
  const [currentDescription, setCurrentDescription] = useState("");
  const [postLength, setPostLength] = useState("short"); // Default to short
  const [includeImage, setIncludeImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const addTopic = () => {
    // Zod Validation for Topic
    const result = generatorSchema.safeParse({ topic: currentTopic });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setTopics([
      ...topics,
      {
        id: Date.now(),
        title: currentTopic,
        description: currentDescription,
        postLength: postLength,
        includeImage: includeImage,
      },
    ]);

    // Animate success or slight feedback could go here
    setCurrentTopic("");
    setCurrentDescription("");
    setError("");
  };

  const removeTopic = (id) => {
    setTopics(topics.filter((t) => t.id !== id));
  };

  const handleSubmit = async () => {
    if (topics.length === 0) {
      setError("Please add at least one keyword/topic");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const createdTopics = [];

      if (!userId) return;

      // Process each "topic" (which is actually a keyword) one by one
      for (const topicItem of topics) {
        // 1. Generate AI Topic from Keyword
        const genResponse = await fetch("/api/generate-topics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword: topicItem.title }), // currently stored in 'title'
        });

        if (!genResponse.ok) console.warn("AI Generation failed for:", topicItem.title);

        const genData = genResponse.ok
          ? await genResponse.json()
          : { title: topicItem.title, description: topicItem.description };

        // 2. Save the FINAL topic to DB
        // We preserve the user's original style/description as requested, only updating the title.
        const response = await fetch("/api/topics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            title: genData.title, // Use the AI generated title
            description: topicItem.description, // PRESERVE the user's selected style!
            postLength: topicItem.postLength,
            includeImage: topicItem.includeImage,
          }),
        });

        if (!response.ok) throw new Error("Failed to create topic");
        const data = await response.json();
        createdTopics.push(data);
      }

      setTopics([]);
      onTopicsCreated(createdTopics);
      toast({
        title: "Success",
        description: `Successfully generated ${createdTopics.length} smart topics from your keywords.`,
      });
    } catch (err) {
      setError(err.message || "Failed to create topics");
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to create topics",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto py-8 space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4 mb-10">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-blue-100 mb-2">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-4xl font-bold tracking-tight text-foreground">
          Content Generator
        </h2>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Transform your ideas into engaging LinkedIn posts with AI. Add your topics below to get started.
        </p>
      </div>

      <div className="grid gap-8">
        <Card className="p-8 border-border/50 shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="pb-1">
                <label className="text-sm font-semibold text-foreground/80 ml-1">
                  What's the keyword or phrase?
                </label>
              </div>
              <Input
                className="h-14 px-5 text-lg bg-background border-border/60 focus:border-primary/50 focus:ring-primary/10 transition-all rounded-xl shadow-sm"
                placeholder="e.g., Marketing, AI in Finance, Remote Work..."
                value={currentTopic}
                onChange={(e) => setCurrentTopic(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTopic()}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground/80 ml-1">
                  Style
                </label>
                <div className="bg-muted/50 p-1 rounded-lg inline-flex">
                  <button
                    onClick={() => setInputType("text")}
                    className={`cursor-pointer px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-2 ${inputType === "text"
                      ? "bg-background text-foreground shadow-sm scale-105"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                      }`}
                  >
                    <Type className="w-3.5 h-3.5" />
                    Custom
                  </button>
                  <button
                    onClick={() => setInputType("dropdown")}
                    className={`cursor-pointer px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-2 ${inputType === "dropdown"
                      ? "bg-background text-foreground shadow-sm scale-105"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                      }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    Presets
                  </button>
                </div>
              </div>

              {inputType === "text" ? (
                <Textarea
                  className="min-h-[120px] p-4 text-base bg-background border-border/60 focus:border-primary/50 focus:ring-primary/10 transition-all rounded-xl resize-none shadow-sm"
                  placeholder="Add any specific context, data points, or key takeaways you want to include..."
                  value={currentDescription}
                  onChange={(e) => setCurrentDescription(e.target.value)}
                />
              ) : (
                <div className="relative">
                  <select
                    className="w-full h-14 pl-4 pr-10 text-base bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer hover:border-border/80"
                    value={currentDescription}
                    onChange={(e) => setCurrentDescription(e.target.value)}
                  >
                    <option value="">Select a writing style...</option>
                    <option value="Write this for someone doomscrolling TikTok: short, sharp, and addictive.">
                      📱 TikTok Style (Short & Addictive)
                    </option>
                    <option value="Make this read like a tweet that goes viral - every word should slap.">
                      🐦 Viral Tweet (Punchy)
                    </option>
                    <option value="Give this the tone of a direct-response marketer who's done $10M in sales.">
                      💰 Direct Response (Sales Focus)
                    </option>
                    <option value="Strip the fluff. Make every sentence fight for its life.">
                      ✂️ No Fluff (Minimalist)
                    </option>
                    <option value="Inject personality: sarcastic, witty, and just bold enough to trigger someone.">
                      😏 Witty & Sarcastic
                    </option>
                    <option value="Pretend you're texting this to your most skeptical friend.">
                      💬 Conversational (Skeptical Friend)
                    </option>
                    <option value="Turn this into a value-packed thread people actually want to save.">
                      🧵 Thread Format (Value Packed)
                    </option>
                    <option value="Use a storytelling approach to hook the reader from the first sentence.">
                      📖 Storytelling Link
                    </option>
                    <option value="Add a controversial opinion to spark debate.">
                      🔥 Controversial Opinion
                    </option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <ChevronDownIcon className="w-5 h-5" />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/40">
              {/* Length Selector */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                  Post Length {!user?.isPremium && <Lock className="w-3 h-3 text-muted-foreground" />}
                </label>
                <div className="relative group/select">
                  <select
                    className={`w-full h-12 pl-4 pr-10 text-sm bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer ${!user?.isPremium ? "opacity-60 cursor-not-allowed" : ""}`}
                    value={postLength}
                    onChange={(e) => user?.isPremium ? setPostLength(e.target.value) : setIsPremiumModalOpen(true)}
                    disabled={!user?.isPremium && postLength === "short"}
                  >
                    <option value="short">Short (Punchy)</option>
                    <option value="medium">Medium (Detailed)</option>
                    <option value="long">Long (Storytelling)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  {!user?.isPremium && (
                    <div className="absolute inset-0 cursor-pointer" onClick={() => setIsPremiumModalOpen(true)} />
                  )}
                </div>
              </div>

              {/* Photo Support */}
              <div className="space-y-3 px-1">
                <label className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                  Visuals {!user?.isPremium && <Lock className="w-3 h-3 text-muted-foreground" />}
                </label>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => user?.isPremium ? setIncludeImage(!includeImage) : setIsPremiumModalOpen(true)}
                  className={`w-full cursor-pointer h-12 justify-between px-4 border-dashed rounded-xl ${includeImage ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground"}`}
                >
                  <span className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Attach Image
                  </span>
                  {includeImage && <div className="w-2 h-2 rounded-full bg-primary" />}
                </Button>
                {!user?.isPremium && <p className="text-[10px] text-muted-foreground italic">Premium only feature</p>}
              </div>
            </div>

            <Button
              onClick={addTopic}
              className="w-full h-14 cursor-pointer text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] rounded-full"
            >
              <Plus className="w-5 h-5 mr-3" />
              Add Topic to Batch
            </Button>
          </div>
        </Card>

        {/* Premium Modal */}
        <PremiumModal
          isOpen={isPremiumModalOpen}
          onClose={() => setIsPremiumModalOpen(false)}
          userPhone={user?.phoneNumber}
          userId={user?.id}
        />


        {topics.length > 0 && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-semibold text-foreground/80 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Queue ({topics.length})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTopics([])}
                className="text-muted-foreground cursor-pointer hover:text-destructive transition-colors text-xs"
              >
                Clear all
              </Button>
            </div>

            <div className="grid gap-3">
              {topics.map((topic, index) => (
                <div
                  key={topic.id}
                  className="group relative flex items-start justify-between p-5 bg-card border border-border/40 rounded-xl hover:border-primary/30 transition-all duration-300 hover:shadow-md animate-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex-1 pr-8">
                    <h4 className="font-semibold text-foreground text-lg mb-1">
                      {topic.title}
                    </h4>
                    {topic.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {topic.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeTopic(topic.id)}
                    className="opacity-0 cursor-pointer group-hover:opacity-100 absolute top-4 right-4 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4">
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg text-center mb-4 font-medium">
                  {error}
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                size="lg"
                className="w-full h-14 cursor-pointer text-lg font-semibold rounded-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-xl shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Spinner className="w-5 h-5 mr-3 text-white" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-3" />
                    Generate Smart Topics
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChevronDownIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
