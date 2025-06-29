import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { LoginSkeleton } from "@/components/skeletons";

const loginSearchSchema = z.object({
  redirect: z.string().optional().catch(""),
});

export const Route = createFileRoute("/login")({
  validateSearch: loginSearchSchema,
  component: Login,
});

function Login() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();

  useEffect(() => {
    // Simulate loading time before redirect
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Redirect to the new sign-in page, forwarding the redirect param
      navigate({ to: "/sign-in", search: { redirect }, replace: true });
    }, 500);

    return () => clearTimeout(timer);
  }, [navigate, redirect]);

  if (isLoading) {
    return <LoginSkeleton />;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="text-center">
        <p>Redirecting to sign in...</p>
      </div>
    </div>
  );
}
