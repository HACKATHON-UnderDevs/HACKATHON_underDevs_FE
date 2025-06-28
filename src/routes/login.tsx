import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LoginForm } from "@/components/login-form";
import { useEffect } from "react";

export const Route = createFileRoute("/login")({component: Login});

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    // Add event listener for form submission
    const handleFormSubmit = (e: Event) => {
      e.preventDefault();
      // Since there's no backend, just navigate to dashboard
      navigate({ to: "/dashboard" });
    };

    // Find the login form and add event listener
    const form = document.querySelector('form');
    if (form) {
      form.addEventListener('submit', handleFormSubmit);
    }

    // Cleanup
    return () => {
      if (form) {
        form.removeEventListener('submit', handleFormSubmit);
      }
    };
  }, [navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <LoginForm />
    </div>
  );
}
