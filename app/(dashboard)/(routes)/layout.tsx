

import Navbar from "@/components/Navbar";
import AppSidebarMain from "@/components/sidebar/app-sidebar-main";
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar";
import { currentUser } from "@/lib/helpers/session";
import { RoleProvider } from "@/lib/context/role-context";


export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [user] = await Promise.all([
        currentUser() ?? null,
    ]);

    return (
        <RoleProvider>
            <SidebarProvider className="sidebar">
                <AppSidebarMain />
                <SidebarInset >
                    <Navbar user={user} />
                    <div className="relative scrollbar-hide">
                        <div id="main-content" className="py-2 px-2 sm:py-4 sm:px-4 overflow-hidden scrollbar-hide">
                            {children}
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </RoleProvider>
    );
}
