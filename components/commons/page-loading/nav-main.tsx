"use client";

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

// Generate placeholder skeleton arrays
const skeletons = Array.from({ length: 10 }, (_, index) => index);

export function NavMain() {


    return (
        <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
            {skeletons.map((_, index) => (
                    <SidebarMenuItem key={index}>
                        <SidebarMenuButton asChild>
                            <div className="flex items-center gap-2 animate-pulse w-full">
                                <div className="h-5 w-5 rounded bg-gray-300" /> {/* Skeleton Icon */}
                                <div className="h-4 w-full rounded bg-gray-300" /> {/* Skeleton Text */}
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
