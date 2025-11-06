"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { X, Plus } from "lucide-react";

export function BatchContentGenerator({ userId, onTopicsCreated }) {
  const [topics, setTopics] = useState([]);
  const [inputType, setInputType] = useState("text");
  const [currentTopic, setCurrentTopic] = useState("");
  const [currentDescription, setCurrentDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const addTopic = () => {
    if (!currentTopic.trim()) {
      setError("Topic title is required");
      return;
    }

    setTopics([
      ...topics,
      {
        id: Date.now(),
        title: currentTopic,
        description: currentDescription,
      },
    ]);

    setCurrentTopic("");
    setCurrentDescription("");
    setError("");
  };

  const removeTopic = (id) => {
    setTopics(topics.filter((t) => t.id !== id));
  };

  const handleSubmit = async () => {
    if (topics.length === 0) {
      setError("Please add at least one topic");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const createdTopics = [];

      if (!userId) return;

      for (const topic of topics) {
        const response = await fetch("/api/topics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            title: topic.title,
            description: topic.description,
          }),
        });

        if (!response.ok) throw new Error("Failed to create topic");
        const data = await response.json();
        createdTopics.push(data);
      }

      setTopics([]);
      onTopicsCreated(createdTopics);
    } catch (err) {
      setError(err.message || "Failed to create topics");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Batch Content Generator</h2>
        <p className="text-muted-foreground">
          Add topics to generate LinkedIn posts automatically
        </p>
      </div>

      <Card className="p-6 space-y-4 border border-border/40 shadow-sm hover:shadow-md transition-shadow">
        <div className="space-y-2">
          <label className="text-sm font-medium my-0 py-0">Topic Title</label>
          <Input
            className="my-px mt-1 border-border/50 focus:border-border/80"
            placeholder="e.g., AI in Business, Remote Work Tips"
            value={currentTopic}
            onChange={(e) => setCurrentTopic(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addTopic()}
          />
        </div>

        <div className="space-y-2 my-2">
          <label className="text-sm font-medium">
            Description / Post Style
          </label>

          {/* Option Toggle */}
          <div className="flex items-center gap-3 mb-2 my-3">
            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                name="inputType"
                value="text"
                checked={inputType === "text"}
                onChange={() => setInputType("text")}
                className="accent-primary"
              />
              Use Textarea
            </label>

            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                name="inputType"
                value="dropdown"
                checked={inputType === "dropdown"}
                onChange={() => setInputType("dropdown")}
                className="accent-primary"
              />
              Choose Post Style
            </label>
          </div>

          {/* Textarea Option */}
          {inputType === "text" && (
            <Textarea
              className="my-px mt-1 border-border/50 focus:border-border/80 resize-none"
              placeholder="Add context or specific points to include in generated posts"
              value={currentDescription}
              onChange={(e) => setCurrentDescription(e.target.value)}
              rows={3}
            />
          )}

          {/* Dropdown Option */}
          {inputType === "dropdown" && (
            <select
              className="w-full border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-border/80 bg-background"
              value={currentDescription}
              onChange={(e) => setCurrentDescription(e.target.value)}
            >
              <option value="">Select a style...</option>
              <option value="Write this for someone doomscrolling TikTok: short, sharp, and addictive.">
                TikTok Doomscrolling: short, sharp, addictive
              </option>
              <option value="Make this read like a tweet that goes viral - every word should slap.">
                Viral Tweet Style
              </option>
              <option value="Give this the tone of a direct-response marketer who's done $10M in sales.">
                Direct Response Marketer
              </option>
              <option value="Strip the fluff. Make every sentence fight for its life.">
                No-Fluff, Punchy Writing
              </option>
              <option value="Inject personality: sarcastic, witty, and just bold enough to trigger someone.">
                Sarcastic & Witty
              </option>
              <option value="Pretend you're texting this to your most skeptical friend.">
                Text to Skeptical Friend
              </option>
              <option value="Turn this into a value-packed thread people actually want to save.">
                Twitter Thread Format
              </option>
              <option value="Use a storytelling approach to hook the reader from the first sentence.">
                Storytelling Hook
              </option>
              <option value="Add a controversial opinion to spark debate.">
                Controversial Opinion
              </option>
              <option value="Use humor to make the content more relatable and shareable.">
                Humorous and Relatable
              </option>
            </select>
          )}

          {/* Static instruction */}
          {/* <p className="text-xs text-muted-foreground mt-1">
            Tip: First of all remove any em-dashes (—) from the post.
          </p> */}
        </div>

        <Button
          onClick={addTopic}
          variant="outline"
          className="w-full bg-transparent border-border/50 hover:bg-muted/50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Topic
        </Button>
      </Card>

      {topics.length > 0 && (
        <Card className="p-6 space-y-4 border border-border/40 shadow-sm">
          <h3 className="font-semibold">Topics to Create ({topics.length})</h3>
          <div className="space-y-2">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="flex items-start justify-between p-3 bg-muted/30 border border-border/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium">{topic.title}</p>
                  {topic.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {topic.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeTopic(topic.id)}
                  className="ml-2 p-1 hover:bg-background rounded transition-colors"
                  aria-label="Remove topic"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Creating Topics...
              </>
            ) : (
              "Create All Topics"
            )}
          </Button>
        </Card>
      )}
    </div>
  );
}
