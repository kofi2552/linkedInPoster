"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { LayoutDashboard, Settings, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BatchContentGenerator } from "@/components/batch-content-generator";
import { TopicCard } from "@/components/topic-card";
import { PostQueue } from "@/components/post-queue";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { PersonaSettings } from "@/components/persona-settings";
import { ProfileSettings } from "@/components/profile-settings";
import { TopicsSkeleton } from "@/components/skeletons";
import { PremiumModal } from "@/components/premium-modal";
import AdminPage from "../admin/page";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

const INITIAL_DELAY = 2000;
const MAX_DELAY = 15000;

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [topics, setTopics] = useState([]);
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTopicsLoading, setIsTopicsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);
  const { data: session, status } = useSession();
  const retryTimeoutRef = useRef(null);
  const isConnectedRef = useRef(false);
  const retryDelayRef = useRef(INITIAL_DELAY);
  const [CronStatus, setCronStatus] = useState("connecting");
  const [activeView, setActiveView] = useState("generator");
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [personaCompletion, setPersonaCompletion] = useState(0);
  // const { toast } = useToast(); // Removed

  console.log("Session data in dashboard:", session);

  // Calculate Persona Completion
  useEffect(() => {
    if (user) {
      const fields = [user.profession, user.industry, user.tone, user.bio];
      const filledCount = fields.filter(f => f && f.trim().length > 0).length;
      setPersonaCompletion((filledCount / 4) * 100);
    }
  }, [user]);

  // Remind Premium users to complete setup
  useEffect(() => {
    if (user?.isPremium && personaCompletion < 100 && !isLoading) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        toast("Finish Your Persona Setup", {
          description: "You have premium access! Complete your persona to unlock the full power PostPilot.",
          action: {
            label: "Finish Setup",
            onClick: () => setActiveView("persona"),
          },
          duration: 8000,
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user?.isPremium, personaCompletion, isLoading]);

  useEffect(() => {
    // Initialize user (in production, get from auth session)
    const initUser = async () => {
      try {
        if (!session?.user?.id) return;

        // Check if LinkedIn is connected (from URL params first)
        const params = new URLSearchParams(window.location.search);
        if (params.get("connected") === "true") {
          setIsLinkedInConnected(true);
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        } else {
          // Check persistent token
          const tokenRes = await fetch(`/api/linkedin/check-token?userId=${session.user.id}`);
          if (tokenRes.ok) {
            const tokenData = await tokenRes.json();
            if (tokenData.connected) {
              setIsLinkedInConnected(true);
            }
          }
        }

        // Fetch full user data including premium status
        const userRes = await fetch(`/api/user?userId=${session.user.id}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }

        // Initialize database
        await fetch("/api/db/init", { method: "POST" });

      } catch (error) {
        console.error("Error initializing:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.id) {
      initUser();
    }
  }, [session]);

  useEffect(() => {
    const tryConnect = async () => {
      if (isConnectedRef.current) return;

      try {
        if (!BACKEND_URL) {
          throw new Error("BACKEND_URL is undefined");
        }

        const res = await fetch(`${BACKEND_URL}/db-status`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        if (!data.success) {
          throw new Error("Backend not ready");
        }

        // ✅ SUCCESS
        console.log("✅ Backend connected");
        isConnectedRef.current = true;
        setCronStatus("connected");
        retryDelayRef.current = INITIAL_DELAY; // reset delay
        toast.success("Backend Connected", {
          description: "Successfully connected to PostPilot.",
        });
        return;
      } catch (err) {
        console.warn(
          `🔁 Backend not ready. Retrying in ${retryDelayRef.current / 1000}s`
        );

        setCronStatus("connecting");

        retryTimeoutRef.current = setTimeout(() => {
          retryDelayRef.current = Math.min(
            retryDelayRef.current * 1.5,
            MAX_DELAY
          );
          tryConnect();
        }, retryDelayRef.current);
      }
    };

    tryConnect();

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const handleTopicsCreated = (newTopics) => {
    setTopics([...topics, ...newTopics]);
    setRefreshTrigger((prev) => prev + 1);
    setActiveView("topics"); // 🚀 Auto-navigate to Topics
    toast.success("Topics generated! Setup your schedule now.");
  };

  const handleScheduleCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
    setActiveView("queue"); // 🚀 Auto-navigate to Queue
    toast.success("Schedule live! View your queue.");
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

      setIsTopicsLoading(true);
      try {
        const response = await fetch(`/api/topics?userId=${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          setTopics(data);
          console.log("✅ Fetched topics for user:", data);
        } else {
          console.warn("⚠️ Failed to fetch topics:", response.statusText);
          toast.error("Error fetching topics", {
            description: "Could not load topics. Please try again later.",
          });
        }
      } catch (error) {
        console.error("🚨 Error fetching topics:", error);
        toast.error("Network Error", {
          description: "Failed to connect to the server.",
        });
      } finally {
        setIsTopicsLoading(false);
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
      <div className="flex items-center justify-center flex-col min-h-screen">
        <Spinner className="w-8 h-8" />
        <p className="text-muted-foreground pt-2">loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated" || session === null) {
    // prevent flash of content while redirecting
    return null;
  }

  // Logic to render content based on activeView
  const renderContent = () => {
    // Common transition wrapper
    const FadeIn = ({ children }) => (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
        {children}
      </div>
    );

    switch (activeView) {
      case "generator":
        return (
          <FadeIn>
            <div className="w-full mx-auto space-y-6">
              <BatchContentGenerator
                userId={session?.user.id}
                user={user}
                onTopicsCreated={handleTopicsCreated}
              />
            </div>
          </FadeIn>
        );
      case "persona":
        return <FadeIn><PersonaSettings userId={session?.user.id} isPremium={user?.isPremium} /></FadeIn>;
      case "profile":
        return (
          <FadeIn>
            <ProfileSettings
              userId={session?.user.id}
              userEmail={session?.user?.email}
              userName={session?.user?.name}
              user={user}
              onUpgrade={() => setIsPremiumModalOpen(true)}
            />
          </FadeIn>
        );
      case "topics":
        return (
          <FadeIn>
            <div className="w-full mx-auto space-y-6">
              <div className="flex flex-col space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Topic Management</h2>
                <p className="text-muted-foreground">
                  Manage your content pillars and saved topics.
                </p>
              </div>
              {isTopicsLoading ? (
                <TopicsSkeleton />
              ) : topics.length === 0 ? (
                <Card className="p-12 border-dashed shadow-sm">
                  <div className="text-center text-muted-foreground flex flex-col items-center justify-center space-y-4">
                    <div className="bg-primary/10 p-4 rounded-full">
                      <LayoutDashboard className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">No topics found</h3>
                    <p className="max-w-sm">
                      You haven't generated any topics yet. Head over to the Generator to get started.
                    </p>
                    <Button onClick={() => setActiveView("generator")}>Go to Generator</Button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  {topics.map((topic) => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      isLinkedInConnected={isLinkedInConnected}
                      onScheduleCreated={handleScheduleCreated}
                      onDeleted={(id) =>
                        setTopics((prev) => prev.filter((t) => t.id !== id))
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </FadeIn>
        );
      case "queue":
        return (
          <FadeIn>
            <div className="w-full mx-auto space-y-6">
              <div className="flex flex-col space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Post Queue</h2>
                <p className="text-muted-foreground">
                  Review, edit, and schedule your upcoming posts.
                </p>
              </div>
              <PostQueue
                userId={session?.user.id}
                refreshTrigger={refreshTrigger}
                onEditPost={handleEditPost}
                onDeletePost={handleDeletePost}
              />
            </div>
          </FadeIn>
        );
      default:
        return (
          <FadeIn>
            <div className="w-full mx-auto space-y-6">
              <div className="flex flex-col space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
                <p className="text-muted-foreground">
                  Manage users and premium subscriptions.
                </p>
              </div>
              <AdminPage />
            </div>
          </FadeIn>
        );
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar
        activeView={activeView}
        onViewChange={setActiveView}
        user={{ ...session?.user, ...user }}
        isLinkedInConnected={isLinkedInConnected}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b bg-background/95 backdrop-blur z-10 sticky top-0">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />

            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="capitalize">{activeView}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="ml-auto flex items-center gap-4">

              {/* Status Indicator */}
              <div className="hidden md:flex">
                {CronStatus === "connected" ? (
                  <span className="flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Scheduler Online
                  </span>
                ) : CronStatus === "connecting" ? (
                  <span className="flex items-center gap-2 text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                    Connecting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-200">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Scheduler Offline
                  </span>
                )}
              </div>


              {/* Premium Button */}
              {!user?.isPremium && (
                <Button
                  onClick={() => setIsPremiumModalOpen(true)}
                  className="bg-gradient-to-r from-amber-500 cursor-pointer to-orange-600 rounded-full hover:from-amber-600 hover:to-orange-700 text-white shadow-md border-0 h-9"
                  size="sm"
                  style={{ width: "150px" }}
                >
                  <Crown className="w-4 h-4 mr-1" />
                  Go Premium
                </Button>
              )}

              {/* Persona Progress (Premium Only) */}
              {user?.isPremium && personaCompletion < 100 && (
                <div className="flex items-center gap-3 bg-muted/30 py-1 px-3 rounded-full border border-border/50 animate-in fade-in zoom-in duration-500">
                  <div className="relative w-8 h-8 flex-shrink-0">
                    <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                      <path className="text-muted/20" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                      <path className="text-amber-500 transition-all duration-1000 ease-out" strokeDasharray={`${personaCompletion}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold">
                      {Math.round(personaCompletion)}%
                    </div>
                  </div>
                  <div className="hidden lg:block text-xs">
                    <p className="font-semibold text-foreground">Persona Setup</p>
                    <button onClick={() => setActiveView("persona")} className="text-amber-600 text-[10px] hover:underline font-medium">
                      Finish now
                    </button>
                  </div>
                </div>
              )}

              {/* Profile Button (Moved from Sidebar) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveView("profile")}
                className={`cursor-pointer flex items-center gap-2 ${activeView === "profile" ? "bg-accent/50 text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Settings className="w-6 h-6" />
                {/* <span className="hidden sm:inline">Profile</span> */}
              </Button>

            </div>

          </div>
        </header>
        <div className="max-w-7xl mx-auto flex flex-col gap-4 p-4 pt-6 md:p-8 md:pt-10" style={{ width: "80%" }}>
          {renderContent()}
        </div>
        <PremiumModal
          isOpen={isPremiumModalOpen}
          onClose={() => setIsPremiumModalOpen(false)}
          userPhone={user?.phoneNumber}
          userId={user?.id}
        />
      </SidebarInset>
    </SidebarProvider >
  );
}
