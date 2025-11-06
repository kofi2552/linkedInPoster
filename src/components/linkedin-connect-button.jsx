"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Linkedin } from "lucide-react";
import { useSession } from "next-auth/react";

export function LinkedInConnectButton({ userId, isConnected, onConnected }) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  // console.log("LinkedInConnectButton - isConnected:", isConnected);
  // console.log("LinkedInConnectButton - userId:", userId);

  const handleConnect = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/linkedin/auth?userId=${session?.user?.id}`
      );
      if (!response.ok) throw new Error("Failed to get auth URL");

      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      console.error("Error connecting LinkedIn:", error);
      setIsLoading(false);
    }
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <Linkedin className="w-5 h-5 text-blue-600" />
        <span className="text-sm font-medium text-blue-900">
          LinkedIn Connected
        </span>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isLoading}
      className="w-full bg-blue-600 hover:bg-blue-700"
    >
      {isLoading ? (
        <>
          <Spinner className="w-4 h-4 mr-2" />
          Connecting...
        </>
      ) : (
        <>
          <Linkedin className="w-4 h-4 mr-2" />
          Connect LinkedIn
        </>
      )}
    </Button>
  );
}
