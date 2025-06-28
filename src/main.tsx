// src/main.tsx
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter, useNavigate } from "@tanstack/react-router";
import { ClerkProvider } from '@clerk/clerk-react'
import { Toaster } from 'sonner';

//theme provider
import { ThemeProvider } from "@/components/shared/ThemeProvider";

// Import the Supabase Providers
import { SupabaseProvider } from './contexts/SupabaseContext';
import { SupportSupabaseProvider } from './contexts/SupportSupabaseContext';
import { GamifySupabaseProvider } from './contexts/GamifySupabaseContext'; // Import the new provider

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

//global styles
import "./index.css";

// Get your Clerk publishable key from environment variable
// You'll need to add this to your .env file
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
	throw new Error("Missing Clerk publishable key");
}

// Create a new router instance
// Pass the router tree and context (including Clerk config)
const router = createRouter({
	routeTree,
	context: {
		auth: undefined!, // Initialize auth context, will be overridden
	},
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
	// Define the auth context shape
	interface RouterContext {
		auth: { publishableKey: string; routerPush: (to: string) => void; routerReplace: (to: string) => void };
	}
}

// This component will wrap the Outlet in the root route
export function ClerkAndThemeProvider({ children }: { children: React.ReactNode }) {
	const navigate = useNavigate();

	return (
		<ClerkProvider 
			publishableKey={CLERK_PUBLISHABLE_KEY}
			// Pass the navigate function to Clerk
			routerPush={(to) => navigate({ to })}
			routerReplace={(to) => navigate({ to, replace: true })}
			// Explicitly define fallback URLs
			signInFallbackRedirectUrl="/dashboard" // Where to go after successful sign-in
			signUpFallbackRedirectUrl="/dashboard" // Where to go if sign-up needs completion (e.g., from SSO)
		>
			<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<SupabaseProvider>
				<SupportSupabaseProvider>
					<GamifySupabaseProvider> {/* Add the new provider here */}
						{children}
						<Toaster />
					</GamifySupabaseProvider>
				</SupportSupabaseProvider>
			</SupabaseProvider>
			</ThemeProvider>
		</ClerkProvider>
	);
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<RouterProvider router={router} />
		</StrictMode>,
	);
}