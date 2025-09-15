"use client";

import { UserCircle } from "lucide-react";
import {
    SidebarMenu,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";

import { capitalizeFirstLetter } from "@/lib/utils";

export function TeamSwitcher({ user }: { user: IEmployee }) {
    const { open } = useSidebar(); // Detects mobile view


    // Hide sidebar on mobile
    if (!open) return null;


    return (
        <SidebarMenu className=" shadow-lg rounded-xl p-3">
            <SidebarMenuItem className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition team-switcher">
                <UserCircle className="w-8 h-8 text-gray-500" />
                <div>
                    <h2 className="text-xs font-semibold text-gray-800">{user?.fullName}</h2>
                    <p className="text-xs text-primary">{capitalizeFirstLetter(user?.role)}</p>
                </div>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
