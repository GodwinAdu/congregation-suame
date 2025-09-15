"use client"

import * as React from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar"

export function TeamSwitcher() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <Skeleton className="w-full h-[50px] rounded-lg" />
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
