"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { SocialConnectButton } from "@/components/social-connect-button";
import { Spinner } from "@/components/ui/spinner";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Connect() {
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  // Fetch connections
  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/user/connections?userId=${session.user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.connectedPlatforms) {
            setConnectedPlatforms(data.connectedPlatforms.map(p => p.platform));
          }
        })
        .catch(err => console.error(err))
        .finally(() => setIsLoading(false));
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [session, status]);

  const steps = [
    "Sign in with Google",
    "Connect your Social Accounts",
    "Create a topic and describe its post style",
    "Set a schedule for the topic",
    "Choose daily, weekly, or monthly schedules",
    "Quick post generated content if needed",
    "Automatic posts go live!",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [steps.length]);


  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f0f4f8]">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  // Logic: if all desired platforms are connected, maybe redirect? 
  // For now, let user stay and manage connections.
  // If user has at least one connection, maybe redirect to dashboard? 
  // Original logic redirected if linkedin was connected. 
  // Let's change behavior: always show this page if visited directly, but if redirected from login, go to dashboard.
  // Actually, let's keep it simple: Stay here.

  // Default page (for users not connected yet)
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full h-screen grid md:grid-cols-2 overflow-hidden relative">
        {/* LEFT COLUMN */}
        <div className="w-full flex flex-col items-center justify-center space-y-6 text-center p-6">
          <h1 className="text-3xl font-bold">Connect Your Accounts</h1>
          <p className="text-muted-foreground max-w-md">
            Automate your posts across LinkedIn, Facebook, Twitter, and more.
          </p>

          <Card className="p-8 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold mb-2 text-center">
              Social Platforms
            </h2>

            {["linkedin", "facebook", "twitter", "instagram", "tiktok"].map((platform) => (
              <SocialConnectButton
                key={platform}
                userId={session?.user.id}
                platform={platform}
                isConnected={connectedPlatforms.includes(platform)}
                onConnected={() => {
                  // Refresh list
                  fetch(`/api/user/connections?userId=${session.user.id}`)
                    .then(res => res.json())
                    .then(data => {
                      if (data.connectedPlatforms) {
                        setConnectedPlatforms(data.connectedPlatforms.map(p => p.platform));
                      }
                    });
                }}
                className="cursor-pointer"
              />
            ))}
          </Card>
        </div>

        {/* VERTICAL DIVIDER LINE */}
        <div className="hidden md:block absolute left-1/2 top-0 h-full w-px bg-gray-200" />

        {/* RIGHT COLUMN — Animated Steps */}
        <div className="bg-gray-50 flex flex-col justify-center p-6 md:p-10 relative overflow-hidden">
          <h2 className="text-lg md:text-xl font-medium mb-0 text-center text-muted-foreground">
            <span className="inline-block text-gray-600 px-6 py-1 rounded-sm shadow">
              How It Works
            </span>
          </h2>

          <div className="relative h-[210px] flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="text-lg md:text-4xl text-center text-text-600 font-bold max-w-md"
              >
                {steps[currentStep]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}