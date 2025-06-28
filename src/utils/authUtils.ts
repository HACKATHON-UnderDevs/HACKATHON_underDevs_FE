// src/utils/authUtils.ts
import { useAuth, useClerk } from "@clerk/clerk-react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/sign-in",
  "/sign-in/sso-callback",
  "/sign-up",
  "/sign-up/continue",
  "/pricing",
  "/features",
  "/blog",
  "/about"
];

// Get environment variables with fallbacks
const getEnvVar = (key: string, fallback: string): string => {
  const value = import.meta.env[`VITE_CLERK_${key}`];
  return value || fallback;
};

/**
 * This is our middleware-like functionality for TanStack Router
 * It handles authentication and route protection at the client level
 */
export function useAuthProtection() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const clerk = useClerk();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const searchParams = new URLSearchParams(routerState.location.search);
  const returnUrl = searchParams.get('redirect') || "/dashboard";
  
  useEffect(() => {
    if (!isLoaded) return;
    
    const isPublicRoute = publicRoutes.some(route => 
      currentPath === route || currentPath.startsWith(`${route}/`)
    );
    
    if (!isPublicRoute && !isSignedIn) {
      navigate({ 
        to: getEnvVar("SIGN_IN_URL", "/login"), 
        search: { redirect: currentPath } 
      });
      return;
    }
    
    if (isSignedIn) {
      if (currentPath === "/login" || currentPath === "/sign-in" || currentPath === "/sign-up" || currentPath === "/sign-up/continue") {
        navigate({ to: getEnvVar("AFTER_SIGN_IN_URL", "/dashboard") });
        return;
      }
    }
  }, [isLoaded, isSignedIn, currentPath, navigate, userId]);
  
  return {
    isLoaded,
    isSignedIn,
    userId,
    signOut: clerk.signOut,
    returnUrl
  };
}

/**
 * Helper for components to use Clerk auth URLs consistently
 */
export function useAuthUrls() {
  return {
    signInUrl: getEnvVar("SIGN_IN_URL", "/login"),
    signUpUrl: getEnvVar("SIGN_UP_URL", "/sign-up"),
    signUpContinueUrl: getEnvVar("SIGN_UP_CONTINUE_URL", "/sign-up/continue"),
    afterSignInUrl: getEnvVar("AFTER_SIGN_IN_URL", "/dashboard"),
    afterSignUpUrl: getEnvVar("AFTER_SIGN_UP_URL", "/sign-up/continue")
  };
}