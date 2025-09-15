"use client";

import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import UserDropdown from "./commons/user-dropdown";
import FullScreenButton from "./commons/FullScreenButton";
import { buttonVariants } from "./ui/button";
import { Map, } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";



const Navbar = ({ user }: { user: IEmployee }) => {



    return (
        <header
            className="flex w-full sticky top-0 z-50 bg-background h-16 border-b shrink-0 items-center gap-2 shadow-md transition-[width,height] ease-linear"
        >
            <div className="flex items-center gap-2 toggle">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
            </div>

            <div className=".dashboard-stats flex gap-4 ml-auto items-center pr-10">
                <div className="fullscreen">

                    <FullScreenButton />
                </div>
                <div className="profile">
                    <UserDropdown
                        email={user?.email}
                        username={user?.fullName}
                        avatarUrl={user?.imgUrl as string}
                        notificationCount={100}
                    />
                </div>
            </div>
        </header>
    );
};

export default Navbar;
