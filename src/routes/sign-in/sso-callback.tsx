import { createFileRoute } from "@tanstack/react-router";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import Silk from "@/components/Silk/Silk";

export const Route = createFileRoute('/sign-in/sso-callback')({
  component: SSOCallback,
});

function SSOCallback() {
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Completing sign in...</h2>
          <p className="text-gray-200 text-sm">Please wait while we finish setting up your account.</p>
        </div>
        <AuthenticateWithRedirectCallback />
      </div>
    </div>
  );
}
