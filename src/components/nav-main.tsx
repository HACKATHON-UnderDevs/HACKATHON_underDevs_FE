import { MailIcon, PlusCircleIcon, type LucideIcon, ChevronRightIcon } from "lucide-react"
import { Link, useMatchRoute } from "@tanstack/react-router"

import { Button } from "@/components/ui/Button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/utils/cn";

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
}) {
  const matchRoute = useMatchRoute();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
            >
              <PlusCircleIcon />
              <span>Quick Create</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="h-9 w-9 shrink-0 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <MailIcon />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = matchRoute({ to: item.url, fuzzy: true });
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={cn("transition-colors duration-200", isActive && "bg-muted text-foreground")}
                >
                  <Link to={item.url}>
                    {item.icon && <item.icon />}
                    <span className="flex-grow">{item.title}</span>
                    <div className="overflow-hidden">
                      <ChevronRightIcon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform duration-300 ease-in-out",
                          isActive ? "translate-x-0" : "-translate-x-full"
                        )}
                      />
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
