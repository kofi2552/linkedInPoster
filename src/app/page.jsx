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
  Users,
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
      setLikeCount((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikeCount((prev) => prev + 1);
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
                <div className="text-[10px] text-muted-foreground">
                  Just now
                </div>
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
            <Badge
              variant="outline"
              className="px-4 py-1.5 text-sm rounded-full border-blue-200 bg-blue-50 text-blue-700 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              <span className="font-semibold">New:</span> Persona-Aware AI
            </Badge>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Your Personal <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Content Creation Tool
              </span>
              .
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
              Stop staring at a blank screen. Automate your thought leadership
              with AI that actually sounds like you, not a robot.
            </p>

            <div className="pt-8 flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700 delay-300">
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <Link href={session ? "/dashboard" : "/login"}>
                  <Button
                    size="lg"
                    className="cursor-pointer h-14 px-8 text-lg rounded-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow w-full sm:w-auto"
                  >
                    {session ? "Go to Dashboard" : "Start Writing for Free"}
                  </Button>
                </Link>
                <Link href="/contributing">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="cursor-pointer h-12 px-8 rounded-full text-base w-full sm:w-auto group"
                  >
                    Join us{" "}
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-background bg-slate-200 overflow-hidden relative"
                    >
                      <Image
                        src={`/images/PP_logo.png`}
                        width={32}
                        height={32}
                        alt="User"
                        className="opacity-0" /* Using logo as placeholder if no user images */
                        style={{ width: 'auto', height: 'auto' }}
                      />
                      <div
                        className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br ${i % 2 === 0
                          ? "from-blue-400 to-blue-600"
                          : "from-purple-400 to-purple-600"
                          }`}
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    </div>
                  ))}
                </div>
                <p>
                  <span className="font-bold text-foreground">2,000+</span>{" "}
                  creators trust PostPilot
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Creative Bento Features Section */}
        <section id="key-features" className="py-24 bg-background relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] mask-image-b-0 pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Everything you need to go viral
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Powerful tools, reduced to the essentials. PostPilot gives you the advantage of a full content team in one intuitive interface.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {/* Feature 1 */}
              <Card className="p-6 border bg-card hover:bg-accent/50 transition-colors duration-300 group">
                <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">Persona-Driven AI</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Define your unique professional voice. Our AI doesn't just write; it mimics your tone, industry nuances, and personality perfectly.
                </p>
              </Card>

              {/* Feature 2 */}
              <Card className="p-6 border bg-card hover:bg-accent/50 transition-colors duration-300 group">
                <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">Smart Scheduling</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Plan weeks of content in minutes. Our scheduler ensures your posts go live exactly when your audience is most active.
                </p>
              </Card>

              {/* Feature 3 */}
              <Card className="p-6 border bg-card hover:bg-accent/50 transition-colors duration-300 group">
                <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Wand2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">Topic Batching</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Never run out of ideas. Generate 50+ relevant, trending post topics in under 30 seconds with a single click.
                </p>
              </Card>

              {/* Feature 4 */}
              <Card className="p-6 border bg-card hover:bg-accent/50 transition-colors duration-300 group">
                <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">Viral Hooks</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Start strong. We utilize data from top-performing posts to generate hooks that stop the scroll and drive engagement.
                </p>
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
                  <Badge
                    variant="outline"
                    className="px-4 py-1 text-sm rounded-full border-purple-200 bg-purple-50 text-purple-700"
                  >
                    <Zap className="w-3.5 h-3.5 mr-2 fill-purple-700" />
                    <span className="font-semibold">Interactive Preview</span>
                  </Badge>
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                    Don't just write. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                      Captivate.
                    </span>
                  </h2>
                  <p className="text-xl text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
                    Experience the difference of AI that understands{" "}
                    <em>engagement</em>, not just algorithms. Interact with the
                    preview to see how your content could look.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href={session ? "/dashboard" : "/login"}>
                    <Button
                      size="lg"
                      className="cursor-pointer h-12 px-8 rounded-full text-base shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 w-full sm:w-auto"
                    >
                      Start Creating Now
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button
                      variant="ghost"
                      size="lg"
                      className="cursor-pointer h-12 px-8 rounded-full text-base w-full sm:w-auto group"
                    >
                      See Pricing{" "}
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">
                        →
                      </span>
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
