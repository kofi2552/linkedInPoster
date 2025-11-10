"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { LinkedInConnectButton } from "@/components/linkedin-connect-button";
import { Spinner } from "@/components/ui/spinner";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Connect() {
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const steps = [
    "Sign in with Google",
    "Connect your LinkedIn account",
    "Create a topic and describe its post style",
    "Set a schedule for the topic",
    "Choose daily, weekly, or monthly schedules",
    "Quick post generated content if needed",
    "Automatic LinkedIn posts go live!",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [steps.length]);

  // useEffect(() => {
  //   if (status === "unauthenticated" || session === null) {
  //     signIn("google");
  //     return;
  //   }

  //   if (status === "loading") return;

  //   const verifyLinkedInConnection = async () => {
  //     try {
  //       const res = await fetch(
  //         `/api/linkedin/check-token?userId=${session.user.id}`
  //       );
  //       const data = await res.json();

  //       if (data.connected) {
  //         setIsLinkedInConnected(true);
  //         router.replace("/dashboard");
  //       }
  //     } catch (error) {
  //       console.error("LinkedIn check error:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   if (session?.user?.id) {
  //     verifyLinkedInConnection();
  //   }
  // }, [status, session, router]);

  // //🌀 Show loader while checking Google login or LinkedIn connection
  // if (status === "loading" || session?.user === undefined || isLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <Spinner className="w-8 h-8" />
  //     </div>
  //   );
  // }

  // If connected, nothing to show because redirect will happen
  if (isLinkedInConnected)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f0f4f8]">
        <Spinner className="w-8 h-8" />
      </div>
    );

  // Default page (for users not connected yet)
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full h-screen grid md:grid-cols-2 overflow-hidden relative">
        {/* LEFT COLUMN */}
        <div className="w-full flex flex-col items-center justify-center space-y-6 text-center p-6">
          <h1 className="text-3xl font-bold">Connect to LinkedIn</h1>
          <p className="text-muted-foreground max-w-md">
            Automate your LinkedIn posts with LinkedIn Content Scheduler.
          </p>

          <Card className="p-8 w-full max-w-sm">
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

        {/* VERTICAL DIVIDER LINE */}
        <div className="hidden md:block absolute left-1/2 top-0 h-full w-px bg-gray-200" />

        {/* RIGHT COLUMN — Animated Steps */}
        <div className="bg-gray-50 flex flex-col justify-center p-6 md:p-10 relative overflow-hidden">
          <h2 className="text-lg md:text-xl font-medium mb-0 text-center text-muted-foreground">
            <span className="inline-block border border-gray-200 px-6 py-1 rounded-xl shadow">
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
                className="text-lg md:text-4xl text-center text-blue-500 font-bold max-w-md"
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
