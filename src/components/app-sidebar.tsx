import { Link } from "@tanstack/react-router";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, FileTextIcon } from "lucide-react";

// This is a placeholder component. It will be replaced with a full implementation later.
export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            LearnSmart AI
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Link to="/dashboard">
                            <SidebarMenuButton>
                                <LayoutDashboardIcon />
                                Dashboard
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <Link to="/notes">
                            <SidebarMenuButton>
                                <FileTextIcon />
                                Notes
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    );
}