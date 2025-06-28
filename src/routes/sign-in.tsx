"use client";

import { createFileRoute } from "@tanstack/react-router";
import logo_bean_journey from "@/images/logo_bean_journal.png";
import { SignIn } from "@clerk/clerk-react";
import Silk from "@/components/Silk/Silk";

export const Route = createFileRoute("/sign-in")({
  component: RouteComponent,
});

function RouteComponent() {
  const signUpUrl = import.meta.env.VITE_CLERK_SIGN_UP_URL || "/sign-up";
  const afterSignInUrl = import.meta.env.VITE_CLERK_AFTER_SIGN_IN_URL || "/dashboard";

  const funFacts = [
    "Journaling can reduce stress and improve your mood.",
    "The world consumes over 2.25 billion cups of coffee every day.",
    "Keeping a journal can boost your memory and cognitive functions.",
    "Brazil is the largest coffee-producing country in the world.",
    "Reflective writing in a journal can lead to better problem-solving skills.",
  ];
  const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];

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
      {/* New "Glass Card" wrapper */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-md sm:max-w-lg md:max-w-3xl lg:max-w-4xl overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-stretch w-full">

          {/* Left Section: Text & Logo */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left py-4 md:flex-none md:w-2/5">
            <img
              src={logo_bean_journey}
              alt="Bean Journey Logo"
              className="w-[11rem] h-[11rem] object-contain md:mx-0 md:-ml-6 md:-mt-12"
            />
            <h1 className="mt-4 text-2xl sm:text-3xl font-publica-sans font-semibold tracking-tight text-white">
              Sign in to your account
            </h1>
            <p className="mt-2 font-mono text-sm sm:text-base text-gray-200"> {/* Adjusted size slightly */}
              Welcome back! Please sign in to continue
            </p>
            {/* Fun Fact Section */}
            <div className="mt-8 p-4 bg-white/5 rounded-lg w-full max-w-xs md:max-w-sm text-center md:text-left">
              <h3 className="font-semibold text-sm text-white/90 mb-1">Did you know?</h3>
              <p className="text-xs text-gray-300/80 italic">{randomFact}</p>
            </div>

            {/* Key Features Section */}
            <div className="mt-6 p-4 w-full max-w-xs md:max-w-sm text-center md:text-left">
              <h3 className="font-semibold text-sm text-white/90 mb-2">What awaits you:</h3>
              <ul className="space-y-1.5 text-xs text-gray-300/80 list-inside list-disc marker:text-green-300/70">
                <li>Effortlessly log your daily reflections.</li>
                <li>Track your mood and habits over time.</li>
                <li>Gain insights with personalized statistics.</li>
              </ul>
            </div>
          </div>

          {/* Separator: Horizontal on mobile, Vertical on md+ */}
          <div className="w-4/5 h-px bg-gray-400/30 my-6 self-center md:hidden"></div>
          <div className="hidden md:block w-px bg-gray-400/30 self-stretch mx-4 sm:mx-6 lg:mx-8"></div>

          {/* Right Section: Clerk Sign In Form */}
          <div className="flex items-center justify-center py-4 pl-6 md:flex-1">
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl={signUpUrl}
              afterSignInUrl={afterSignInUrl}
              redirectUrl="/sign-in/sso-callback"
              appearance={{
                elements: {
                  rootBox: "bg-transparent w-full", // Updated
                  header: "hidden",
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
