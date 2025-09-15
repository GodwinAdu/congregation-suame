"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { TeamSwitcher } from "./team-switcher"
import SideContent from "./sidebar"
import { NavUser } from "./nav-user"




interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRole: IRole,
  user:IEmployee
}

export function AppSidebar(props: AppSidebarProps) {
  const { user,  userRole, ...rest } = props;

  return (
    <Sidebar collapsible="icon" {...rest}>
      <SidebarHeader>
        <TeamSwitcher user={user}  />
      </SidebarHeader>
      <SidebarContent className="scrollbar-hide">
        <SideContent user={user}  role={userRole?.permissions} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}