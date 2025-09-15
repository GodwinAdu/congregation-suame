"use client";

import { MoreHorizontal } from "lucide-react";

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

// Generate placeholder skeleton arrays
const skeletons = Array.from({ length: 3 }, (_, index) => index);

export function NavProjects() {
    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarMenu>
                {skeletons.map((_, index) => (
                    <SidebarMenuItem key={index}>
                        <SidebarMenuButton asChild>
                            <div className="flex items-center gap-2 animate-pulse">
                                <div className="h-5 w-5 rounded bg-gray-300" /> {/* Skeleton Icon */}
                                <div className="h-4 w-24 rounded bg-gray-300" /> {/* Skeleton Text */}
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                    <SidebarMenuButton className="text-sidebar-foreground/70">
                        <MoreHorizontal className="text-sidebar-foreground/70" />
                        <span>More</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    );
}
