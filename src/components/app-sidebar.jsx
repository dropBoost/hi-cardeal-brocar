"use client"

import * as React from "react"
import { NavMain } from "@/components/nav-main"
import { navManager } from "@/app/settings"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { FaCircle } from "react-icons/fa";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import Image from "next/image"

const data = {
  softwareDrop: [
    {
      name: "hi-photo",
      url: "https://www.dropboost.it",
      icon: FaCircle,
    },
    {
      name: "hi-cardeal",
      url: "https://www.dropboost.it",
      icon: FaCircle,
    },
  ],
}

export function AppSidebar( { profilo, settings }) {

  const logo = settings?.logoDark

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:p-1.5!">
              {logo ? (
                <Image
                  src={logo}
                  width={30}
                  height={100}
                  className="w-auto h-auto"
                  alt={settings?.companyName || "Logo"}
                />
              ) : null}
              <span className="text-xs font-semibold">{settings?.companyName || ""}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navManager} label="manager"/>
        <NavProjects projects={data.softwareDrop} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={profilo} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
