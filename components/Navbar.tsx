"use client";

import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import UserDropdown from "./commons/user-dropdown";
import FullScreenButton from "./commons/FullScreenButton";
import { LanguageSwitcher } from "./language-switcher";



const Navbar = ({ user }: { user: IEmployee }) => {



    return (
        <header
            className="flex w-full sticky top-0 z-50 bg-background h-14 sm:h-16 border-b shrink-0 items-center gap-2 shadow-md transition-[width,height] ease-linear"
        >
            <div className="flex items-center gap-2 toggle pl-2 sm:pl-0">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
            </div>

            <div className="dashboard-stats flex gap-2 sm:gap-4 ml-auto items-center pr-2 sm:pr-10">
                <div className="language-switcher">
                    <LanguageSwitcher />
                </div>
                <div className="fullscreen ">
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
