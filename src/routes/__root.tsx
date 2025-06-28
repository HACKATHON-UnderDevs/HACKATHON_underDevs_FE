import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

// components
import { ModeToggle } from "@/components/shared/ModeToggle";
import { ClerkAndThemeProvider } from "../main";
import { useAuthProtection } from "@/utils/authUtils";

function AuthProtector() {
	useAuthProtection();
	return null;
}

export const Route = createRootRoute({
	component: () => (
		<ClerkAndThemeProvider>
			<AuthProtector />
			<div className="absolute top-2 right-2 z-10">
				<ModeToggle />
			</div>
			<Outlet />
			<TanStackRouterDevtools />
		</ClerkAndThemeProvider>
	),
});
