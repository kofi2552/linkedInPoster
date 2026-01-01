"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export function AnalyticsTracker() {
    const pathname = usePathname();
    const { data: session } = useSession();

    useEffect(() => {
        if (!session?.user?.id) return;

        const logPageView = async () => {
            try {
                await fetch("/api/log", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "PAGE_VIEW",
                        details: pathname,
                    }),
                });
            } catch (error) {
                console.error("Failed to log page view:", error);
            }
        };

        logPageView();
    }, [pathname, session]);

    return null;
}
