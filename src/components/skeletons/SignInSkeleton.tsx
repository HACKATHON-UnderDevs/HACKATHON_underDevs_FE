import { Skeleton } from "@/components/ui/skeleton";
import Silk from "@/components/Silk/Silk";

export function SignInSkeleton() {
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
      {/* Glass Card wrapper */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-md sm:max-w-lg md:max-w-3xl lg:max-w-4xl overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-stretch w-full">

          {/* Left Section: Text & Logo */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left py-4 md:flex-none md:w-2/5">
            <Skeleton className="w-44 h-44 rounded-lg" />
            <Skeleton className="mt-4 h-8 w-64" />
            <Skeleton className="mt-2 h-5 w-56" />
            
            {/* Fun Fact Section */}
            <div className="mt-8 p-4 bg-white/5 rounded-lg w-full max-w-xs md:max-w-sm">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>

            {/* Key Features Section */}
            <div className="mt-6 p-4 w-full max-w-xs md:max-w-sm">
              <Skeleton className="h-4 w-32 mb-2" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
          </div>

          {/* Separator: Horizontal on mobile, Vertical on md+ */}
          <div className="w-4/5 h-px bg-gray-400/30 my-6 self-center md:hidden"></div>
          <div className="hidden md:block w-px bg-gray-400/30 self-stretch mx-4 sm:mx-6 lg:mx-8"></div>

          {/* Right Section: Sign In Form */}
          <div className="flex items-center justify-center py-4 pl-6 md:flex-1">
            <div className="w-full max-w-sm space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-px flex-1" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-px flex-1" />
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="text-center">
                <Skeleton className="h-4 w-48 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}