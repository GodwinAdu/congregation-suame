"use client"

import {
  ChevronRight,
  Settings,
  LayoutDashboard,
  History,
  Trash2,
  Users,
  MapPin,
  CheckSquare,
  FileText,
  Car,
  UserCheck,
  BookOpen,
  Sparkles,
  MessageSquare,
  DollarSign,
  Calendar,
  FolderOpen,
  Bot,
  Bell,
  TrendingUp,
  BarChart3,
  Heart,
  ClipboardList,
  GraduationCap,
  Target,
  FileCheck,
  Package,
  School,
  AlertTriangle,
  Receipt,
  Database
} from "lucide-react"
import { IRole } from "@/lib/models/role.models"
import { useTranslations } from 'next-intl'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  url: string;
  icon?: React.ComponentType;
  roleField?: keyof IRole | string;
  isActive?: boolean;
  items?: NavItem[];
}


interface NavMainProps {
  role: IRole | undefined;
  user: any | undefined
}

export function NavMain({ role, user }: NavMainProps) {
  const pathname = usePathname();
  const t = useTranslations();

  const [openGroup, setOpenGroup] = useState<string | null>(null)

  const navMain: (NavItem | false)[] = [
    {
      title: t('navigation.dashboard'),
      url: `/dashboard`,
      icon: LayoutDashboard,
      isActive: false,
      roleField: "dashboard"
    },
    {
      title: t('sidebar.myPublisherDashboard'),
      url: "#",
      icon: TrendingUp,
      roleField: "publisherDashboard",
      items: [
        {
          title: "Dashboard",
          url: `/dashboard/publisher`,
        },
        {
          title: "My Goals",
          url: `/dashboard/publisher/goals`,
          roleField: "publisherGoals"
        }
      ],
    },
    {
      title: t('sidebar.configuration'),
      url: "#",
      icon: Settings,
      roleField:"config",
      items: [
        {
          title: t('sidebar.groups'),
          url: `/dashboard/config/group`,
        },
        {
          title: t('sidebar.privileges'),
          url: `/dashboard/config/privilege`,
        },
        {
          title: t('sidebar.roles'),
          url: `/dashboard/config/role`
        },
        {
          title: t('sidebar.duties'),
          url: `/dashboard/config/duties`,
        }
      ],
    },
    {
      title: "Attendance",
      url: "#",
      icon: UserCheck,
      roleField: "manageAttendance",
      items: [
        {
          title: "Overview",
          url: `/dashboard/attendance`,
        },
        {
          title: "Attendance Tracker",
          url: `/dashboard/attendance/attendance-tracker`,
        },
        {
          title: "Analytics",
          url: `/dashboard/attendance/analytics`,
          roleField: "manageAttendance"
        }
      ],
    },
    {
      title: t('navigation.members'),
      url: "#",
      icon: Users,
      roleField: "manageAllMembers",
      items: [
        {
          title: t('sidebar.allMembers'),
          url: `/dashboard/members`,
        },
        {
          title: "Group Assignment",
          url: `/dashboard/members/group-assignment`,
        },
        {
          title: t('sidebar.families'),
          url: `/dashboard/members/families`,
        },
        {
          title: t('sidebar.analytics'),
          url: `/dashboard/members/analytics`,
        },
        {
          title: t('sidebar.locationMap'),
          url: `/dashboard/members/map`,
        }
      ],
    },
    {
      title: "Field Service Reports",
      url: "#",
      icon: FileText,
      roleField: "manageAllReport",
      items: [
        {
          title: "All Reports",
          url: `/dashboard/manage-report`,
        },
        {
          title: "Overseer Reports",
          url: `/dashboard/overseer-report`,
          roleField: "overseerReports"
        },
        {
          title: "Overseer Analytics",
          url: `/dashboard/overseer-analytics`,
          roleField: "overseerAnalytics"
        },
        {
          title: "Monthly Report",
          url: `/dashboard/monthly-report`,
          roleField: "monthlyReport"
        },
        {
          title: "Help Needed",
          url: `/dashboard/monthly-report/help-needed`,
          roleField: "monthlyReportHelpNeeded"
        },
        {
          title: "Public Witnessing",
          url: `/dashboard/field-service/public-witnessing`,
        },
        {
          title: "Meeting Schedule",
          url: `/dashboard/field-service/meeting-schedule`,
        },
        {
          title: "Generate Report",
          url: `/dashboard/field-service/generate-report`,
          roleField: "manageAllReport"
        },
        {
          title: "Pioneer Summary",
          url: `/dashboard/field-service/pioneer-summary`,
          roleField: "manageAllReport"
        },
        {
          title: "Activity Summary",
          url: `/dashboard/field-service/summary`,
          roleField: "manageAllReport"
        }
      ],
    },
    {
      title: "Group Management",
      url: `/dashboard/group`,
      icon: Users,
      isActive: false,
      roleField: "manageGroupReport"
    },
    {
      title: "Group Field Reports",
      url: `/dashboard/manage-group-report`,
      icon: FileText,
      isActive: false,
      roleField: "manageGroupReport"
    },
    {
      title: "Shepherding Calls",
      url: `/dashboard/shepherding`,
      icon: Heart,
      isActive: false,
      roleField: "shepherdingView"
    },
    {
      title: "Bible Studies",
      url: `/dashboard/bible-studies`,
      icon: GraduationCap,
      isActive: false,
      roleField: "bibleStudyView"
    },
    {
      title: "Publisher Records",
      url: `/dashboard/publisher-records`,
      icon: FileCheck,
      isActive: false,
      roleField: "publisherRecords"
    },
    {
      title: "Literature Inventory",
      url: `/dashboard/literature`,
      icon: Package,
      isActive: false,
      roleField: "literature"
    },
    {
      title: "Theocratic School",
      url: `/dashboard/theocratic-school`,
      icon: School,
      isActive: false,
      roleField: "theocraticSchool"
    },
    {
      title: "Emergency System",
      url: `/dashboard/emergency`,
      icon: AlertTriangle,
      isActive: false,
      roleField: "emergency"
    },
    {
      title: "Transport",
      url: `/dashboard/transport`,
      icon: Car,
      isActive: false,
      roleField: "transport"
    },
    {
      title: "Meeting Assignments",
      url: "#",
      icon: BookOpen,
      roleField: "assignments",
      items: [
        {
          title: "Assignments",
          url: `/dashboard/assignments`,
        },
        {
          title: "Assignment History",
          url: `/dashboard/assignments/history`,
          roleField: "assignmentHistoryView"
        }
      ],
    },
    {
      title: "Kingdom Hall Management",
      url: `/dashboard/cleaning`,
      icon: Sparkles,
      isActive: false,
      roleField: "cleaning"
    },
    {
      title: t('sidebar.territoryManagement'),
      url: "#",
      icon: MapPin,
      roleField: "territory",
      items: [
        {
          title: t('territory.territoryMap'),
          url: `/dashboard/territories`,
          roleField: "territoryView"
        },
        {
          title: t('territory.territoryList'),
          url: `/dashboard/territories/list`,
          roleField: "territoryManage"
        },
        {
          title: "Territory Management",
          url: `/dashboard/territories/manage`,
          roleField: "territoryManage"
        },
        {
          title: t('territory.assignments'),
          url: `/dashboard/territories/assignments`,
          roleField: "territoryAssign"
        },
        {
          title: t('territory.analytics'),
          url: `/dashboard/territories/analytics`,
          roleField: "territoryAnalytics"
        },
        {
          title: t('territory.import'),
          url: `/dashboard/territories/import`,
          roleField: "territoryImport"
        }
      ],
    },
    {
      title: t('sidebar.coVisitManagement'),
      url: "#",
      icon: UserCheck,
      roleField: "coVisitView",
      items: [
        {
          title: t('coVisit.visitSchedule'),
          url: `/dashboard/co-visit`,
          roleField: "coVisitView"
        },
        {
          title: t('coVisit.manageVisits'),
          url: `/dashboard/co-visit/manage`,
          roleField: "coVisitManage"
        },
        {
          title: t('coVisit.scheduleVisit'),
          url: `/dashboard/co-visit/schedule`,
          roleField: "coVisitSchedule"
        },
        {
          title: "CO Reports",
          url: `/dashboard/co-visit/reports`,
          roleField: "coVisitView"
        }
      ],
    },
    {
      title: "Financial Management",
      url: "#",
      icon: DollarSign,
      roleField: "financial",
      items: [
        {
          title: "Overview",
          url: `/dashboard/financial`,
        },
        {
          title: "Contributions",
          url: `/dashboard/financial/contributions`,
        },
        {
          title: "Expenses",
          url: `/dashboard/financial/expenses`,
        },
        {
          title: "Budget",
          url: `/dashboard/financial/budget`,
        },
        {
          title: "Analytics",
          url: `/dashboard/financial/analytics`,
        }
      ],
    },
    {
      title: "Communication Hub",
      url: "#",
      icon: MessageSquare,
      roleField: "communication",
      items: [
        {
          title: "Overview",
          url: `/dashboard/communication`,
        },
        {
          title: "Messages",
          url: `/dashboard/communication/messages`,
        },
        {
          title: "Announcements",
          url: `/dashboard/communication/announcements`,
        },
        {
          title: "Broadcasts",
          url: `/dashboard/communication/broadcasts`,
        }
      ],
    },
    {
      title: "Events & Calendar",
      url: "#",
      icon: Calendar,
      roleField: "events",
      items: [
        {
          title: "Events",
          url: `/dashboard/events`,
        },
        {
          title: "Calendar",
          url: `/dashboard/calendar`,
        }
      ],
    },
    {
      title: "Document Management",
      url: "#",
      icon: FolderOpen,
      roleField: "documents",
      items: [
        {
          title: "Documents",
          url: `/dashboard/documents`,
        },
        {
          title: "Forms",
          url: `/dashboard/documents/forms`,
        }
      ],
    },
    {
      title: "AI Assistant",
      url: "#",
      icon: Bot,
      roleField: "aiAssistant",
      items: [
        {
          title: "Assignment Suggestions",
          url: `/dashboard/ai/assignments`,
        },
        {
          title: "Member Insights",
          url: `/dashboard/ai/insights`,
        },
        {
          title: "Analytics",
          url: `/dashboard/ai/analytics`,
        }
      ],
    },
    {
      title: "Notifications",
      url: `/dashboard/notifications`,
      icon: Bell,
      isActive: false,
      roleField: "notifications"
    },
    {
      title: "History",
      url: `/dashboard/history`,
      icon: History,
      isActive: false,
      roleField: "history"
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      roleField: "settings",
      items: [
        {
          title: "Profile",
          url: `/dashboard/profile`,
        },
        {
          title: "Notifications",
          url: `/dashboard/settings/notifications`,
        },
        {
          title: "Backup & Restore",
          url: `/dashboard/backup`,
          roleField: "config"
        },
        {
          title: "Reset Password",
          url: `/dashboard/reset-password`,
        },
        {
          title: "Update Permissions",
          url: `/dashboard/update-permissions`,
          roleField: "updatePermissions"
        }
      ],
    },
    {
      title: "Recycle Bin",
      url: `/dashboard/trash`,
      icon: Trash2,
      isActive: false,
      roleField: "trash"
    }
  ];
  const isActive = useCallback(
    (url: string) => {
      const dashboardPath = `/dashboard`;

      if (pathname === dashboardPath || pathname === `${dashboardPath}/`) {
        return url === pathname; // Only activate when it exactly matches the dashboard
      }

      return pathname.startsWith(url) && url !== dashboardPath;
    },
    [pathname, ,]
  );

  // Automatically open collapsible if an item inside is active
  useEffect(() => {
    navMain.filter((group): group is NavItem => group !== false).forEach((group) => {
      if (group.items?.some((item) => isActive(item.url))) {
        setOpenGroup(group.title);
      }
    });
  }, [pathname]);


  return (

    <SidebarGroup className="scrollbar-hide">
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu >
        {navMain
          .filter((item): item is NavItem => item !== false)
          .filter((item) => !item.roleField || (role && role[item.roleField as keyof IRole]))
          .map((item) =>
            item.items ? (
              <Collapsible
                key={item.title}
                open={openGroup === item.title}
                onOpenChange={() => setOpenGroup((prev) => (prev === item.title ? null : item.title))}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={cn(
                        "transition-colors hover:bg-primary/10 hover:text-primary",
                        item.items?.some((subItem) => isActive(subItem.url)) && "bg-primary text-white font-medium",
                      )}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight
                        className={`ml-auto shrink-0 transition-transform duration-200 ${openGroup === item.title ? "rotate-90" : ""}`}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items
                        ?.filter((subItem) => !subItem?.roleField || (role && role[subItem?.roleField as keyof IRole]))
                        .map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              className={cn(
                                "transition-colors hover:text-primary",
                                isActive(subItem.url) && "bg-primary/10 text-primary font-medium",
                              )}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={cn(
                    "transition-colors hover:bg-primary/10 hover:text-primary",
                    isActive(item.url) && "bg-primary text-white font-medium",
                  )}
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ),
          )}
      </SidebarMenu>
    </SidebarGroup>

  )
}
