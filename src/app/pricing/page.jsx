"use client";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Crown, Zap } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <SiteHeader />

            <main className="flex-1 container mx-auto px-4 py-20">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                        Simple pricing.
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        No hidden fees. One plan, lifetime access to all premium features.
                    </p>
                </div>

                <div className="max-w-md mx-auto">
                    <Card className="p-8 border-2 border-blue-100 dark:border-blue-900 shadow-2xl relative overflow-hidden">
                        <div className="w-full flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                    <Crown className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-blue-600">Premium Plan</h3>
                                    <p className="text-sm text-muted-foreground">For serious creators</p>
                                </div>
                            </div>

                            <div className="">
                                <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                    Most Popular
                                </div>
                            </div>
                        </div>
                        <div className="flex items-baseline justify-center gap-1 my-6">
                            <span className="text-5xl font-extrabold">$20</span>
                            <span className="text-muted-foreground">/month</span>
                        </div>

                        <div className="space-y-4 mb-8">
                            {[
                                "Unlimited AI Generated Posts",
                                "Custom Persona & Tone Handling",
                                "AI Image Generation (DALL-E 3)",
                                "Advanced Scheduling & Queues",
                                "Priority WhatsApp Support",
                                "Early Access to New Features"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                        <Check className="w-3 h-3" />
                                    </div>
                                    <span className="text-sm font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <Link href="/login">
                            <Button size="lg" className="w-full h-12 text-base rounded-xl shadow-lg shadow-blue-500/20">
                                Get Started Now
                            </Button>
                        </Link>
                        <p className="text-center text-xs text-muted-foreground mt-4">
                            Secure payment processing. Cancel anytime.
                        </p>
                    </Card>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
