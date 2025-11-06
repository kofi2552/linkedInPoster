"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BatchContentGenerator } from "@/components/batch-content-generator";
import { TopicCard } from "@/components/topic-card";
import { PostQueue } from "@/components/post-queue";
import { Spinner } from "@/components/ui/spinner";
import { LogOut, UserCircle } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Dashboard() {
  const [userId, setUserId] = useState(null);
  const [topics, setTopics] = useState([]);
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);
  const { data: session, status } = useSession();

  //console.log("Session data in dashboard:", session);

  useEffect(() => {
    // Initialize user (in production, get from auth session)
    const initUser = async () => {
      try {
        // Check if LinkedIn is connected (from URL params)
        const params = new URLSearchParams(window.location.search);
        if (params.get("connected") === "true") {
          setIsLinkedInConnected(true);
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }

        // Initialize database
        await fetch("/api/db/init", { method: "POST" });

        // Fetch topics
      } catch (error) {
        console.error("Error initializing:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initUser();
  }, []);

  const handleTopicsCreated = (newTopics) => {
    setTopics([...topics, ...newTopics]);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleScheduleCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleEditPost = (updatedPost) => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDeletePost = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    const fetchTopics = async () => {
      if (!session?.user?.id) return; // ✅ guard clause

      try {
        const response = await fetch(`/api/topics?userId=${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          setTopics(data);
          console.log("✅ Fetched topics for user:", data);
        } else {
          console.warn("⚠️ Failed to fetch topics:", response.statusText);
        }
      } catch (error) {
        console.error("🚨 Error fetching topics:", error);
      }
    };

    fetchTopics();
  }, [session]); // ✅ no need for "status" unless it affects fetching

  useEffect(() => {
    if (status === "unauthenticated" || session === null) {
      signIn();
    }
  }, [status, session]);

  if (status === "loading" || session?.user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (status === "unauthenticated" || session === null) {
    // prevent flash of content while redirecting
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2 flex flex-col md:flex-row md:justify-between md:items-center text-center md:text-left">
          <div className="py-2">
            <h1 className="text-2xl font-bold">LinkedIn Scheduler</h1>
            <p className="text-muted-foreground">
              Automate your LinkedIn posts with AI-generated content
            </p>
          </div>

          <div className="relative group flex items-center justify-center w-[50px] h-[50px] overflow-hidden">
            {/* Profile Image or fallback */}
            <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-in-out group-hover:-translate-x-full">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full border border-gray-300 shadow-sm"
                />
              ) : (
                <UserCircle
                  className="w-10 h-10 text-gray-400 transition-transform duration-300 group-hover:translate-x-2"
                  color="#777"
                />
              )}
            </div>

            {/* Logout icon slides in on hover */}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="cursor-pointer absolute inset-0 flex items-center justify-center translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out"
            >
              <LogOut className="w-6 h-6 text-gray-600 hover:text-red-500 transition-colors duration-300" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generator">Generator</TabsTrigger>
            <TabsTrigger value="topics">Topics</TabsTrigger>
            <TabsTrigger value="queue">Queue</TabsTrigger>
          </TabsList>

          {/* Generator Tab */}
          <TabsContent value="generator" className="space-y-6">
            <BatchContentGenerator
              userId={session?.user.id}
              onTopicsCreated={handleTopicsCreated}
            />
          </TabsContent>

          {/* Topics Tab */}
          <TabsContent value="topics" className="space-y-6">
            {topics.length === 0 ? (
              <Card className="p-6">
                <div className="text-center text-muted-foreground">
                  <p>
                    No topics created yet. Go to the Generator tab to create
                    topics.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {topics.map((topic) => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    onScheduleCreated={handleScheduleCreated}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Queue Tab */}
          <TabsContent value="queue" className="space-y-6">
            <PostQueue
              userId={session?.user.id}
              refreshTrigger={refreshTrigger}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
