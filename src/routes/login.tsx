import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/login")({component: Login});

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new sign-in page
    navigate({ to: "/sign-in", replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="text-center">
        <p>Redirecting to sign in...</p>
      </div>
    </div>
  );
}
