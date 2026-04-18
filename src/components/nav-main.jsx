"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({ items = [], label = "Platform" }) {
  const pathname = usePathname();

  const activeParentKey = useMemo(() => {
    const activeParent = items.find((item) =>
      item.items?.some((subItem) => {
        if (!subItem?.url) return false;
        return pathname === subItem.url;
      })
    );

    return activeParent?.title ?? null;
  }, [items, pathname]);

  const [openKey, setOpenKey] = useState(activeParentKey);

  useEffect(() => {
    setOpenKey(activeParentKey);
  }, [activeParentKey]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>

      <SidebarMenu>
        {items.map((item) => {
          const key = item.title;
          const isOpen = openKey === key;
          const hasChildren = item.items && item.items.length > 0;

          if (!hasChildren) {
            const isActive = pathname === item.url;

            return (
              <SidebarMenuItem key={key}>
                <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                  <Link href={item.url || "#"}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={key}
              asChild
              open={isOpen}
              onOpenChange={(next) => setOpenKey(next ? key : null)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => {
                      const isSubActive = pathname === subItem.url

                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={isSubActive}>
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}