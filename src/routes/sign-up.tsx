"use client";

import { createFileRoute } from "@tanstack/react-router";
import { SignUp } from "@clerk/clerk-react"; // Import SignUp component
import logo from "@/images/logo-full-white.png";
import Silk from "@/components/Silk/Silk"; // Added Silk import
import { useState, useEffect } from "react";
import { SignUpSkeleton } from "@/components/skeletons";

export const Route = createFileRoute("/sign-up")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isLoading, setIsLoading] = useState(true);
  const signInUrl = import.meta.env.VITE_CLERK_SIGN_IN_URL || "/sign-in";
  const afterSignUpUrl = import.meta.env.VITE_CLERK_AFTER_SIGN_UP_URL || "/dashboard";

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 950);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SignUpSkeleton />;
  }

  // Key features, similar to sign-in page
  const keyFeatures = [
    "Create smart notes with AI assistance.",
    "Generate flashcards automatically.",
    "Collaborate with study partners in real-time.",
    "Organize your study schedule efficiently.",
  ];

  const studyPrompts = [
    "What subject are you most excited to master today?",
    "Describe your ideal study environment.",
    "What's one concept you want to understand better this week?",
    "If you could collaborate with any study partner, who would it be and why?",
    "What study technique works best for you?",
    "Write about a time when learning something new felt rewarding."
  ];
  const randomPrompt = studyPrompts[Math.floor(Math.random() * studyPrompts.length)];

  return (
    <div className="relative grid min-h-screen place-items-center px-4 py-10">
      <div className="absolute inset-0 -z-10">
        <Silk
          speed={5}
          scale={1}
          color="#647E5D" // Consistent dark green background
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>
      {/* Glass Card wrapper, adjusted to match sign-in's max-width for two columns */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-md sm:max-w-lg md:max-w-3xl lg:max-w-4xl overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-stretch w-full">

          {/* Left Section: Text & Logo */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left py-4 md:flex-none md:w-2/5">
            <img
              src={logo}
              alt="StudySync Logo"
              className="w-[25rem] h-[11rem] object-contain md:mx-0 md:-ml-2 md:-mt-12" // Matched sign-in logo style
            />
            <h1 className="mt-4 text-2xl sm:text-3xl font-publica-sans font-semibold tracking-tight text-white">
              Create your account
            </h1>
            <p className="mt-2 font-mono text-sm sm:text-base text-gray-200">
              Let's get you started!
            </p>
            
            {/* Study Prompt Section - Style Update */}
            <div className="mt-8 p-4 bg-white/5 rounded-lg w-full max-w-xs md:max-w-sm text-center md:text-left">
              <h3 className="font-semibold text-sm text-white/90 mb-1">Study Prompt:</h3>
              <p className="text-sm text-white/95 italic font-medium">{randomPrompt}</p> {/* Emphasized prompt */}
            </div>

            {/* Why StudySync? Section - Style Update */}
            <div className="mt-6 p-4 bg-transparent border border-white/20 rounded-lg w-full max-w-xs md:max-w-sm text-center md:text-left">
              <h3 className="font-semibold text-sm text-white/90 mb-1">Why join us?</h3>
              <p className="text-xs text-gray-300/80">
                We believe studying should be smart, collaborative, and efficient. 
                Our platform combines AI-powered tools with real-time collaboration 
                to help you achieve your academic goals faster.
              </p>
            </div>

            {/* Key Features Section - Style Update */}
            <div className="mt-6 p-4 w-full max-w-xs md:max-w-sm text-center md:text-left"> {/* Slightly more opaque background */}
              <h3 className="font-semibold text-sm text-white/90 mb-2">Discover what's inside:</h3>
              <ul className="space-y-1.5 text-xs text-gray-300/80 list-inside list-disc marker:text-green-300/70">
                {keyFeatures.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Separator: Horizontal on mobile, Vertical on md+ */}
          <div className="w-4/5 h-px bg-gray-400/30 my-6 self-center md:hidden"></div>
          <div className="hidden md:block w-px bg-gray-400/30 self-stretch mx-4 sm:mx-6 lg:mx-8"></div>

          {/* Right Section: Clerk Sign Up Form */}
          <div className="flex items-center justify-center py-4 md:pl-6 md:flex-1"> {/* Added md:pl-6 for consistency */}
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl={signInUrl}
              afterSignUpUrl={afterSignUpUrl}
              redirectUrl={afterSignUpUrl} // Clerk recommends afterSignUpUrl for redirectUrl on sign-up
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
