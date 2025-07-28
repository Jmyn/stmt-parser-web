import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { GitGraph, Home, Inbox, User } from "lucide-react";
import getConfig from "next/config";
import { ModeToggle } from "../theme-provider/theme-toggle";

const { publicRuntimeConfig } = getConfig();
const baseUrl = publicRuntimeConfig.baseUrl;
// Menu items.
const items = [
  {
    title: "Transactions",
    url: `${baseUrl}/transactions`,
    icon: Home,
  },
  {
    title: "Rules",
    url: `${baseUrl}/transactions/rules`,
    icon: Inbox,
  },
  {
    title: "Stats",
    url: `${baseUrl}/stats`,
    icon: GitGraph,
  },
  {
    title: "Profile",
    url: `${baseUrl}/profile`,
    icon: User,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <ModeToggle />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroupLabel>Application</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
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
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}