// src/components/app-sidebar.tsx
import {
  ClipboardListIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
  UserCircle,
  Palette,
  SwordsIcon,
} from "lucide-react"
import { UserButton, useUser } from "@clerk/clerk-react"
import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Sample data for navigation
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Notes",
      url: "/notes",
      icon: FileTextIcon,
    },
    {
      title: "AI Generation",
      url: "/ai-generation",
      icon: FileCodeIcon,
    },
    {
      title: "Workspace",
      url: "/workspace",
      icon: UsersIcon,
    },
    {
      title: "Multiplayer Quiz",
      url: "/quiz",
      icon: SwordsIcon,
    },
    {
      title: "Study Schedule",
      url: "/study-schedule",
      icon: ClipboardListIcon,
    },
  ],
  documents: [
    {
      name: "Recent Documents",
      url: "#",
      icon: FileIcon,
    },
    {
      name: "Shared Files",
      url: "#",
      icon: DatabaseIcon,
    },
  ],
  navSecondary: [
    {
      title: "Search",
      url: "#",
      icon: SearchIcon,
    },
    {
      title: "Help",
      url: "#",
      icon: HelpCircleIcon,
    },
  ],
};

export function AppSidebar({ ...props }) {
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    return (
      <div className="p-4">
        <p>Please sign in to access the application.</p>
      </div>
    )
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/">
                <img 
                  src="/src/images/logo-full.svg" 
                  alt="LearnSmart AI Logo" 
                  className="h-9 w-auto mx-auto brightness-0 dark:brightness-0 dark:invert" 
                />
              </Link>
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
        <SidebarMenu className="NavUser">
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="user-menu-button w-full">
              <div className="flex items-center gap-3 w-full">
                <UserButton
                  showName
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "h-10 w-10 order-1",
                      userButtonOuterIdentifier:
                        "text-left font-semibold text-base truncate order-2 text-gray-900 dark:text-white",
                      userButtonBox: "flex w-full items-center gap-3",
                      userButtonTrigger:
                        "flex items-center w-full my-6 pr-12 pl-4",
                    },
                  }}
                  userProfileProps={{
                    appearance: { variables: { colorPrimary: "#3b82f6" } },
                  }}
                >
                  <UserButton.MenuItems>
                    <UserButton.Link
                      href="/profile"
                      label="My Profile"
                      labelIcon={<UserCircle size={16} />}
                    />
                  </UserButton.MenuItems>
                  <UserButton.UserProfilePage
                    label="Settings"
                    url="settings"
                    labelIcon={<SettingsIcon size={16} />}
                  >
                    <div className="w-full">
                      <h1 className="text-[1.05rem] font-bold mb-2 border-b pb-4">
                        Application Settings
                      </h1>
                      <div className="space-y-8 py-4">
                        <div className="border-b pb-6">
                          <h2 className="text-[0.8rem] mb-4 font-medium text-[#212126] dark:text-gray-300">
                            Theme
                          </h2>
                          <div className="flex flex-col gap-4">
                            <button className="h-20 w-full bg-gradient-to-r from-blue-100 to-blue-500 rounded-xl shadow-md focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all hover:scale-105 active:scale-95"></button>
                            <button className="h-20 w-full bg-gradient-to-r from-gray-100 to-gray-800 rounded-xl shadow-md focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all hover:scale-105 active:scale-95"></button>
                          </div>
                        </div>
                        <div className="border-b pb-6">
                          <h2 className="text-[0.8rem] mb-3 font-medium text-[#212126] dark:text-gray-300">
                            Font
                          </h2>
                          <div className="flex space-x-3">
                            <button className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg shadow-md text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                              Inter
                            </button>
                            <button className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 rounded-lg shadow-md text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                              Roboto
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </UserButton.UserProfilePage>
                  <UserButton.UserProfilePage
                    label="Preferences"
                    url="preferences"
                    labelIcon={<Palette size={16} />}
                  >
                    <div className="w-full">
                      <h1 className="text-[1.05rem] font-bold mb-2 border-b pb-4">
                        User Preferences
                      </h1>
                      <div className="space-y-6 py-4">
                        <div className="border-b pb-6">
                          <h2 className="text-[0.8rem] mb-3 font-medium text-[#212126] dark:text-gray-300">
                            Notifications
                          </h2>
                          <div className="space-y-3">
                            <label className="flex items-center space-x-3">
                              <input type="checkbox" className="rounded" defaultChecked />
                              <span className="text-sm">Email notifications</span>
                            </label>
                            <label className="flex items-center space-x-3">
                              <input type="checkbox" className="rounded" defaultChecked />
                              <span className="text-sm">Push notifications</span>
                            </label>
                          </div>
                        </div>
                        <div className="mt-6">
                          <h3 className="text-[0.8rem] mb-3 font-medium text-[#212126] dark:text-gray-300">
                            Language
                          </h3>
                          <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white">
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </UserButton.UserProfilePage>
                </UserButton>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}