"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";

export function SiteHeader() {
    const { data: session } = useSession();

    return (
        <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <Image src="/images/PP_logo.png" alt="PostPilot" width={32} height={32} />
                        <span>PostPilot</span>
                    </Link>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <Link href="/pricing" className="hover:text-foreground transition-colors">
                            Pricing
                        </Link>
                        <Link href="/contributing" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                            <Heart className="w-4 h-4 text-red-500 fill-red-500/10" />
                            Contributing
                        </Link>
                    </div>
                    {session ? (
                        <Link href="/dashboard">
                            <Button>Dashboard</Button>
                        </Link>
                    ) : (
                        <Link href="/login">
                            <Button variant="outline" className="cursor-pointer">Get Started</Button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
