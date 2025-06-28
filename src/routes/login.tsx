import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LoginSkeleton } from "@/components/skeletons";

export const Route = createFileRoute("/login")({component: Login});

function Login() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading time before redirect
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Redirect to the new sign-in page
      navigate({ to: "/sign-in", replace: true });
    }, 500);

    return () => clearTimeout(timer);
  }, [navigate]);

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
