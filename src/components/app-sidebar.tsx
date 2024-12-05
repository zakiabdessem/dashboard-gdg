// NOTE: remove the line below before editing this file
/* eslint-disable */
"use client";
import {
  Calendar,
  ChartArea,
  Home,
  Inbox,
  Logs,
  Rss,
  ScanLine,
  Search,
  Settings,
  Swords,
  TicketCheck,
  User2,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Statistics",
    url: "/dashboard",
    icon: ChartArea,
  },
  {
    title: "Participants",
    url: "/dashboard/participants",
    icon: UserRound,
  },
  {
    title: "Teams",
    url: "/dashboard/teams",
    icon: UsersRound,
  },
  {
    title: "Checks (In/Out)",
    url: "/dashboard/checks",
    icon: ScanLine,
  },
  {
    title: "Challenges",
    url: "/dashboard/challenges",
    icon: Swords,
  },
  {
    title: "Notifications",
    url: "/dashboard/notifications",
    icon: Rss,
  },
  {
    title: "Logs",
    url: "/dashboard/logs",
    icon: Logs,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="h-5 w-full">
              {items.map((item) => (
                <SidebarMenuItem className="h-12 w-full" key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="flex flex-row items-center justify-start space-x-2 border-t">
        <User2 />
        <div>User</div>
      </SidebarFooter>
    </Sidebar>
  );
}
