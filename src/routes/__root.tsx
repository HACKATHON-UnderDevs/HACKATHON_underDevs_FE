import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

// components
import { ModeToggle } from "@/components/shared/ModeToggle";

export const Route = createRootRoute({
	component: () => (
		<>
			<div className="absolute top-2 right-2 z-10">
				<ModeToggle />
			</div>
			<Outlet />
			<TanStackRouterDevtools />
		</>
	),
});
