
"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar";
import {
    Wand2,
    List,
    Layers,
    LayoutDashboard,
    LogOut,
    UserCircle,
    ChevronsUpDown,
    Settings,
    Shield,
    Crown,
    Link,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PremiumModal } from "@/components/premium-modal";
import { useState } from "react";
import { signOut } from "next-auth/react";

export function AppSidebar({ activeView, onViewChange, user, isLinkedInConnected }) {
    const { isMobile } = useSidebar();
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

    const items = [
        {
            title: "Generator",
            view: "generator",
            icon: Wand2,
        },
        {
            title: "Persona",
            view: "persona",
            icon: UserCircle,
        },
        {
            title: "Topics",
            view: "topics",
            icon: List,
        },
        {
            title: "Queue",
            view: "queue",
            icon: Layers,
        },
        // Profile moved to navbar
        {
            title: "Admin",
            view: "admin",
            icon: Shield,
            isAdminOnly: true,
        },
    ];


    const LINKEDIN_AUTH_URL = "/connect"

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-3 py-0 text-sidebar-accent-foreground">
                            <div className="flex items-center justify-center">
                                <Image
                                    src="/images/PP_logo.png"
                                    alt="PostPilot Logo Mark"
                                    width={60}
                                    height={60}
                                    priority
                                    className="object-contain"
                                />
                            </div>

                            <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                                <span className="text-2xl font-bold">PostPilot</span>
                                <span className="text-xs text-muted-foreground">Pro Dashboard</span>
                            </div>
                        </div>

                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>


                            {items.map((item) => {
                                if (item.isAdminOnly && !user?.isAdmin) return null;

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            isActive={activeView === item.view}
                                            onClick={() => onViewChange(item.view)}
                                            tooltip={item.title}
                                            size="lg"
                                            className="transition-all duration-200 ease-in-out
                                                        flex items-center gap-3
                                                        justify-start
                                                        hover:bg-sidebar-accent
                                                        hover:pl-4
                                                        group-data-[collapsible=icon]:justify-center
                                                        group-data-[collapsible=icon]:hover:pl-0
                                                        cursor-pointer
                                                    "
                                        >
                                            <item.icon className="h-5 w-5 shrink-0" />
                                            <span className="font-medium group-data-[collapsible=icon]:hidden">
                                                {item.title}
                                            </span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            }).filter(Boolean)}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                {/* Critical Action Alert */}
                {!isLinkedInConnected && (
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={() => window.location.href = "/connect"}
                            size="lg"
                            className="bg-destructive/10 text-destructive cursor-pointer hover:bg-destructive/20 hover:text-destructive border border-destructive/20 transition-all animate-pulse"
                            tooltip="Action Required"
                        >
                            <div className="w-full mx-auto flex items-center justify-center gap-2">

                                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-destructive text-white text-[10px] font-bold ml-4 text-center">
                                    !
                                </div>
                                <span className="font-semibold group-data-[collapsible=icon]:hidden">
                                    Connect LinkedIn
                                </span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                )}

                {user?.isPremium && (
                    <div className="">
                        <div
                            className="
                                        flex items-center justify-center gap-2
                                        w-full rounded-md
                                        bg-amber-50 text-amber-700
                                        border border-amber-200
                                        px-3 py-2 text-sm font-medium
                                        group-data-[collapsible=icon]:justify-center
                                    "
                        >
                            <Crown className="w-4 h-4 shrink-0" />
                            <span className="font-medium group-data-[collapsible=icon]:hidden">
                                Premium User
                            </span>
                        </div>
                    </div>
                )}

                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu className="border border-t">
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent cursor-pointer data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <div className="relative">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src={user?.image} alt={user?.name || ""} />
                                            <AvatarFallback className="rounded-lg">
                                                <UserCircle className="h-6 w-6" />
                                            </AvatarFallback>
                                        </Avatar>
                                        {isLinkedInConnected && (
                                            <span className="absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                                        )}
                                    </div>

                                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                        <span className="truncate font-semibold">
                                            {user?.name || "User"}
                                        </span>
                                        <span className="truncate text-xs">
                                            {user?.email || "Account"}
                                        </span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side={isMobile ? "bottom" : "right"}
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src={user?.image} alt={user?.name} />
                                            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">
                                                {user?.name}
                                            </span>
                                            <span className="truncate text-xs">{user?.email}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                {!isLinkedInConnected ? (
                                    <>
                                        <DropdownMenuItem onClick={() => window.location.href = LINKEDIN_AUTH_URL} className="text-blue-600 font-medium">
                                            <div className="flex items-center w-full cursor-pointer">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse" />
                                                Connect LinkedIn
                                            </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                ) : (
                                    <>
                                        <DropdownMenuItem className="text-green-600 font-medium">
                                            <div className="flex items-center w-full">
                                                <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                                                LinkedIn Connected
                                            </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                )}

                                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
            <PremiumModal
                isOpen={isPremiumModalOpen}
                onClose={() => setIsPremiumModalOpen(false)}
                userPhone={user?.phoneNumber}
                userId={user?.id}
            />
        </Sidebar>
    );
}
