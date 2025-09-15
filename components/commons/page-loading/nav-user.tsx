"use client"


import {
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

export function NavUser() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
            <Skeleton className="w-full h-[50px] rounded-lg" />
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
