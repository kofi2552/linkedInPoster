"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Sparkles,
  Wand2,
  Calendar,
  Linkedin,
  Heart,
  MessageSquare,
  Repeat,
  Send,
  Zap,
  ThumbsUp,
  Users
} from "lucide-react";
import { DemoCard } from "@/components/demo-card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function LandingPage() {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(1248);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(prev => prev - 1);
      setIsLiked(false);
    } else {
      setLikeCount(prev => prev + 1);
      setIsLiked(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar */}
      <SiteHeader />


      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
            <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
          </div>

          {/* Floating Elements (Left) */}
          <div className="hidden lg:block absolute top-1/4 left-10 xl:left-20 animate-in fade-in slide-in-from-left-10 duration-1000 delay-500">
            <Card className="p-4 flex items-center gap-3 backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border-white/20 shadow-xl rotate-[-6deg] hover:rotate-0 transition-transform cursor-default">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Linkedin className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="text-xs font-semibold">Post Published</div>
                <div className="text-[10px] text-muted-foreground">Just now</div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-green-500 ml-2" />
            </Card>
          </div>

          {/* Floating Elements (Right) */}
          <div className="hidden lg:block absolute top-1/3 right-10 xl:right-20 animate-in fade-in slide-in-from-right-10 duration-1000 delay-700">
            <Card className="p-4 w-48 space-y-3 backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border-white/20 shadow-xl rotate-[6deg] hover:rotate-0 transition-transform cursor-default">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Viral Score</span>
                <span className="text-green-600 font-bold">98/100</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-emerald-600 w-[98%]" />
              </div>
            </Card>
          </div>

          <div className="container px-4 mx-auto relative z-10 text-center space-y-8 max-w-4xl">
            <Badge variant="outline" className="px-4 py-1.5 text-sm rounded-full border-blue-200 bg-blue-50 text-blue-700 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              <span className="font-semibold">New:</span> Persona-Aware AI
            </Badge>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Your Personal <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">LinkedIn Ghostwriter</span>.
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
              Stop staring at a blank screen. Automate your thought leadership with AI that actually sounds like you, not a robot.
            </p>

            <div className="pt-8 flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700 delay-300">
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <Link href={session ? "/dashboard" : "/login"}>
                  <Button size="lg" className="cursor-pointer h-14 px-8 text-lg rounded-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow w-full sm:w-auto">
                    {session ? "Go to Dashboard" : "Start Writing for Free"}
                  </Button>
                </Link>
                <Link href="/contributing">
                  <Button variant="ghost" size="lg" className="cursor-pointer h-12 px-8 rounded-full text-base w-full sm:w-auto group">
                    Join us <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-slate-200 overflow-hidden relative">
                      <Image src={`/images/PP_logo.png`} width={32} height={32} alt="User" className="opacity-0" /* Using logo as placeholder if no user images */ />
                      <div className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br ${i % 2 === 0 ? 'from-blue-400 to-blue-600' : 'from-purple-400 to-purple-600'}`}>
                        {String.fromCharCode(64 + i)}
                      </div>
                    </div>
                  ))}
                </div>
                <p><span className="font-bold text-foreground">2,000+</span> creators trust PostPilot</p>
              </div>
            </div>
          </div>
        </section>

        {/* Creative Bento Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Everything you need to go viral</h2>
              <p className="text-muted-foreground text-lg">Powerful tools wrapped in a beautiful, distraction-free interface.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 max-w-5xl mx-auto h-auto md:h-[480px]">
              {/* Feature 1: Main (Persona) - 2x2 */}
              <Card className="md:col-span-2 md:row-span-2 p-6 flex flex-col justify-between overflow-hidden relative group border-none shadow-lg bg-gradient-to-br from-white to-blue-50/50 dark:from-zinc-900 dark:to-zinc-900/50">
                <div className="absolute top-0 right-0 p-8 opacity-5 md:opacity-10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
                  <Users className="w-48 h-48 text-blue-600" />
                </div>
                <div className="relative z-10 space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">Persona-Driven AI</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Most AI sounds generic. PostPilot is different. You define your tone, profession, and industry, and we custom-tune every single post to match your unique voice. It's like having a ghostwriter who actually knows you.
                  </p>
                </div>
                <div className="mt-2 relative h-40 bg-background/50 backdrop-blur rounded-lg border border-border/50 p-3 shadow-sm group-hover:translate-y-[-3px] transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-[10px] font-bold">You</div>
                    <div className="h-1.5 w-20 bg-muted rounded-full" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full bg-muted/50 rounded-full" />
                    <div className="h-1.5 w-5/6 bg-muted/50 rounded-full" />
                    <div className="h-1.5 w-4/6 bg-muted/50 rounded-full" />
                  </div>
                  <div className="absolute bottom-3 right-3 text-[10px] text-blue-600 font-medium flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Optimized for you
                  </div>
                </div>
              </Card>

              {/* Feature 2: Scheduling - 1x2 */}
              <Card className="md:col-span-1 md:row-span-2 p-5 flex flex-col relative group border-none shadow-md bg-white dark:bg-zinc-900">
                <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] mask-image-b-0" />
                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 mb-3">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold mb-1">Smart Schedule</h3>
                  <p className="text-xs text-muted-foreground mb-4">Queue up weeks of content. We'll handle the posting.</p>

                  {/* Calendar Visual */}
                  <div className="flex-1 bg-muted/20 rounded-lg border border-border/50 p-2 space-y-1.5 group-hover:bg-muted/30 transition-colors">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-2 p-1.5 bg-background rounded border border-border/50 shadow-sm">
                        <div className="w-0.5 h-5 rounded-full bg-green-500" />
                        <div className="space-y-1 flex-1">
                          <div className="h-1 w-10 bg-muted rounded-full" />
                          <div className="h-1 w-16 bg-muted/50 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Feature 3: Batching - 1x1 */}
              <Card className="md:col-span-1 p-5 flex flex-col justify-center border-none shadow-md bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/10 dark:to-zinc-900">
                <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 mb-2">
                  <Wand2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold">Topic Batching</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Generate 50+ ideas in 30 seconds.</p>
              </Card>

              {/* Feature 4: Analytics (Placeholder/Visual) - 1x1 */}
              <Card className="md:col-span-1 p-5 flex flex-col justify-center border-none shadow-md bg-white dark:bg-zinc-900 overflow-hidden relative group">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-20 h-20 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors" />
                <div className="relative z-10">
                  <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 mb-2">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold">Viral Hooks</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">AI trained on top performing posts.</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section className="min-h-screen flex items-center py-20 px-4 bg-muted/20 relative overflow-hidden">
          {/* Background Glows */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[100px] rounded-full opacity-50 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full opacity-50 pointer-events-none" />

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left Column: The Demo Card */}
              <div className="order-2 lg:order-1 flex justify-center lg:justify-end perspective-1000">
                <div className="relative group w-full max-w-md">
                  {/* Glow effect behind card */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <DemoCard />
                </div>
              </div>

              {/* Right Column: CTA & Content */}
              <div className="order-1 lg:order-2 space-y-8 text-center lg:text-left">
                <div className="space-y-4">
                  <Badge variant="outline" className="px-4 py-1 text-sm rounded-full border-purple-200 bg-purple-50 text-purple-700">
                    <Zap className="w-3.5 h-3.5 mr-2 fill-purple-700" />
                    <span className="font-semibold">Interactive Preview</span>
                  </Badge>
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                    Don't just write. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Captivate.</span>
                  </h2>
                  <p className="text-xl text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
                    Experience the difference of AI that understands <em>engagement</em>, not just algorithms.
                    Interact with the preview to see how your content could look.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href={session ? "/dashboard" : "/login"}>
                    <Button size="lg" className="cursor-pointer h-12 px-8 rounded-full text-base shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 w-full sm:w-auto">
                      Start Creating Now
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button variant="ghost" size="lg" className="cursor-pointer h-12 px-8 rounded-full text-base w-full sm:w-auto group">
                      See Pricing <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </Button>
                  </Link>
                </div>

                <div className="pt-4 flex items-center justify-center lg:justify-start gap-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Free to try</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>No credit card required</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
