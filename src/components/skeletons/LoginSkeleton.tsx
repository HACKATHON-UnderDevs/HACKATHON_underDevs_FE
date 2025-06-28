import { Skeleton } from "@/components/ui/skeleton";

export function LoginSkeleton() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="text-center">
        <Skeleton className="h-6 w-48" />
      </div>
    </div>
  );
}