"use client";

import { Button } from "@/components/ui/button";
import { Check, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const platformConfig = {
    linkedin: {
        name: "LinkedIn",
        icon: Linkedin,
        color: "bg-[#0077b5] hover:bg-[#006097]",
    },
    facebook: {
        name: "Facebook",
        icon: Facebook,
        color: "bg-[#1877F2] hover:bg-[#166fe5]",
    },
    twitter: {
        name: "X (Twitter)",
        icon: Twitter,
        color: "bg-black hover:bg-gray-800",
    },
    instagram: {
        name: "Instagram",
        icon: Instagram,
        color: "bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-90",
    },
    tiktok: {
        name: "TikTok",
        icon: ({ className }) => (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                fill="currentColor"
                className={className}
            >
                <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a90.25,90.25,0,1,0,43.7,77.79V83h91.7A122,122,0,0,0,448,209.91Z" />
            </svg>
        ),
        color: "bg-black hover:bg-gray-800",
    },
};

export function SocialConnectButton({ userId, platform, isConnected, onConnected, className }) {
    const [loading, setLoading] = useState(false);
    const config = platformConfig[platform] || platformConfig.linkedin;
    const Icon = config.icon;

    const handleConnect = async () => {
        setLoading(true);
        try {
            // Fetch auth URL from our generic route
            const res = await fetch(`/api/connect/${platform}/auth?userId=${userId}`);
            const data = await res.json();

            if (data.authUrl) {
                window.location.href = data.authUrl;
            } else {
                console.error("No auth URL returned");
                setLoading(false);
            }
        } catch (error) {
            console.error("Connect error:", error);
            setLoading(false);
        }
    };

    if (isConnected) {
        return (
            <Button
                className={cn("w-full bg-green-600 hover:bg-green-700 text-white cursor-default", className)}
                disabled
            >
                <Check className="w-4 h-4 mr-2" />
                {config.name} Connected
            </Button>
        );
    }

    return (
        <Button
            onClick={handleConnect}
            disabled={loading}
            className={cn("w-full text-white", config.color, className)}
        >
            {loading ? (
                <Spinner className="mr-2 h-4 w-4 text-white" />
            ) : (
                <Icon className="mr-2 h-4 w-4" />
            )}
            {loading ? "Connecting..." : `Connect ${config.name}`}
        </Button>
    );
}
