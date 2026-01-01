"use client";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Code2, MessageCircle } from "lucide-react";

export default function ContributingPage() {
    const handleContactClick = () => {
        const message = encodeURIComponent("Hi, I'm interested in contributing to PostPilot! I'm a developer/designer.");
        const whatsappUrl = `https://wa.me/233594955819?text=${message}`;
        window.open(whatsappUrl, "_blank");
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <SiteHeader />

            <main className="flex-1 container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">

                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-8 animate-pulse">
                    <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                </div>

                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                    Help Build the Future
                </h1>

                <p className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
                    PostPilot is growing, and we're looking for passionate developers and designers to join our journey.
                    Whether you love React, AI, or beautiful UI, your code can impact thousands of creators.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mb-12">
                    <Card className="p-6 border-none shadow-md bg-muted/30">
                        <Code2 className="w-8 h-8 text-blue-600 mb-4 mx-auto" />
                        <h3 className="font-bold mb-2">Code</h3>
                        <p className="text-sm text-muted-foreground">Help us squash bugs and build new features.</p>
                    </Card>
                    <Card className="p-6 border-none shadow-md bg-muted/30">
                        <Heart className="w-8 h-8 text-red-500 mb-4 mx-auto" />
                        <h3 className="font-bold mb-2">Design</h3>
                        <p className="text-sm text-muted-foreground">Improve our UX and make the app beautiful.</p>
                    </Card>
                    <Card className="p-6 border-none shadow-md bg-muted/30">
                        <MessageCircle className="w-8 h-8 text-green-600 mb-4 mx-auto" />
                        <h3 className="font-bold mb-2">Feedback</h3>
                        <p className="text-sm text-muted-foreground">Test new features and give us your thoughts.</p>
                    </Card>
                </div>

                <Button
                    onClick={handleContactClick}
                    size="lg"
                    className="h-14 px-8 text-lg rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white shadow-lg shadow-green-500/20"
                >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Contact us on WhatsApp
                </Button>

            </main>

            <SiteFooter />
        </div>
    );
}
