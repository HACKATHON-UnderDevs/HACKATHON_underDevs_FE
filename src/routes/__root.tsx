import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { SupabaseProvider } from '@/contexts/SupabaseContext';
import { StudySessionProvider } from '@/contexts/StudySessionContext';
import { useAuthProtection } from '@/utils/authUtils';

// components
import { ModeToggle } from "@/components/shared/ModeToggle";
import { ClerkAndThemeProvider } from "../main";

function AuthProtector() {
	useAuthProtection();
	return <></>;
}

export const Route = createRootRoute({
	component: () => (
		<ClerkAndThemeProvider>
			<SupabaseProvider>
				<StudySessionProvider>
					<div className="absolute top-2 right-2 z-10">
						<ModeToggle />
					</div>
					<AuthProtector />
					<Outlet />
					<TanStackRouterDevtools />
				</StudySessionProvider>
			</SupabaseProvider>
		</ClerkAndThemeProvider>
	),
});
