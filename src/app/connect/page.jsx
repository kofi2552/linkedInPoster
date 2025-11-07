"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { LinkedInConnectButton } from "@/components/linkedin-connect-button";
import { Spinner } from "@/components/ui/spinner";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Connect() {
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated" || session === null) {
      signIn("google");
      return;
    }

    if (status === "loading") return;

    const verifyLinkedInConnection = async () => {
      try {
        const res = await fetch(
          `/api/linkedin/check-token?userId=${session.user.id}`
        );
        const data = await res.json();

        if (data.connected) {
          setIsLinkedInConnected(true);
          router.replace("/dashboard");
        }
      } catch (error) {
        console.error("LinkedIn check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.id) {
      verifyLinkedInConnection();
    }
  }, [status, session, router]);

  // 🌀 Show loader while checking Google login or LinkedIn connection
  if (status === "loading" || session?.user === undefined || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  // If connected, nothing to show because redirect will happen
  if (isLinkedInConnected)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f0f4f8]">
        <Spinner className="w-8 h-8" />
      </div>
    );

  // Default page (for users not connected yet)
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl min-h-screen flex items-center justify-center flex-col mx-auto p-6 space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold">Connect to LinkedIn</h1>
          <p className="text-muted-foreground">
            Automate your LinkedIn posts with LinkedIn Content Scheduler
          </p>
        </div>

        <Card className="p-6 px-6">
          <h2 className="text-lg font-semibold mb-0 text-center">
            LinkedIn Account
          </h2>
          <LinkedInConnectButton
            userId={session?.user.id}
            isConnected={isLinkedInConnected}
            onConnected={() => setIsLinkedInConnected(true)}
            className="cursor-pointer"
          />
        </Card>
      </div>
    </div>
  );
}
