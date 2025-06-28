import { createFileRoute } from "@tanstack/react-router";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { useNavigate } from "@tanstack/react-router";
import Silk from "@/components/Silk/Silk";
import { useEffect, useState } from "react";

export const Route = createFileRoute('/sign-in/sso-callback')({
  component: SSOCallback,
});

function SSOCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set a timeout to handle cases where the callback takes too long
    const timeout = setTimeout(() => {
      setError("Authentication is taking longer than expected. Please try again.");
      setIsLoading(false);
    }, 30000); // 30 seconds timeout

    return () => clearTimeout(timeout);
  }, []);

  const handleSignInCallback = () => {
    setIsLoading(false);
    // Navigate to dashboard after successful authentication
    navigate({ to: "/dashboard" });
  };

  const handleError = (error: any) => {
    console.error("SSO Callback Error:", error);
    setError(error?.message || "An error occurred during sign in. Please try again.");
    setIsLoading(false);
  };

  if (error) {
    return (
      <div className="relative grid min-h-screen place-items-center px-4 py-10">
        <div className="absolute inset-0 -z-10">
          <Silk
            speed={5}
            scale={1}
            color="#647E5D"
            noiseIntensity={1.5}
            rotation={0}
          />
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md">
          <div className="flex flex-col items-center text-center">
            <div className="text-red-400 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Sign In Error</h2>
            <p className="text-gray-200 text-sm mb-4">{error}</p>
            <button
              onClick={() => navigate({ to: "/sign-in" })}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative grid min-h-screen place-items-center px-4 py-10">
      <div className="absolute inset-0 -z-10">
        <Silk
          speed={5}
          scale={1}
          color="#647E5D" // Dark green background
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          {isLoading && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
          )}
          <h2 className="text-xl font-semibold text-white mb-2">Completing sign in...</h2>
          <p className="text-gray-200 text-sm">Please wait while we finish setting up your account.</p>
        </div>
        <AuthenticateWithRedirectCallback
          afterSignInUrl="/dashboard"
          afterSignUpUrl="/dashboard"
          redirectUrl="/dashboard"
          continueSignUpUrl="/dashboard"
          onError={handleError}
        />
      </div>
    </div>
  );
}
