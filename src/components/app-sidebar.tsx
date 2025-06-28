import * as React from "react"
import {
  ArrowUpCircleIcon,
  CameraIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Student",
    email: "student@learningplatform.com",
    avatar: "/avatars/student.jpg",
  },
  navMain: [
    {
      title: "Learning Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "My Notes",
      url: "#",
      icon: FileTextIcon,
    },
    {
      title: "AI Generation",
      url: "#",
      icon: FileCodeIcon,
    },
    {
      title: "Study Schedule",
      url: "#",
      icon: ListIcon,
    },
    {
      title: "Collaboration",
      url: "#",
      icon: UsersIcon,
    },
  ],
  navClouds: [
    {
      title: "Flashcards",
      icon: CameraIcon,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Review Queue",
          url: "#",
        },
        {
          title: "Mastered Cards",
          url: "#",
        },
      ],
    },
    {
      title: "Quizzes",
      icon: FileTextIcon,
      url: "#",
      items: [
        {
          title: "Practice Tests",
          url: "#",
        },
        {
          title: "Quiz History",
          url: "#",
        },
      ],
    },
    {
      title: "Study Groups",
      icon: UsersIcon,
      url: "#",
      items: [
        {
          title: "My Groups",
          url: "#",
        },
        {
          title: "Join Group",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: SettingsIcon,
    },
    {
      title: "Get Help",
      url: "#",
      icon: HelpCircleIcon,
    },
    {
      title: "Search",
      url: "#",
      icon: SearchIcon,
    },
  ],
  documents: [
    {
      name: "Study Materials",
      url: "#",
      icon: DatabaseIcon,
    },
    {
      name: "Progress Reports",
      url: "#",
      icon: ClipboardListIcon,
    },
    {
      name: "AI Assistant",
      url: "#",
      icon: FileIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">LearnSmart AI</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
