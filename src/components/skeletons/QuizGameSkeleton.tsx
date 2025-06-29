// src/components/skeletons/QuizGameSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function QuizGameSkeleton() {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-950 p-4 lg:p-6 animate-pulse">
      {/* Game Header */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center text-center">
        <Skeleton className="h-8 w-64 mb-4" />
        <Card className="w-full max-w-4xl p-6 md:p-10 text-center">
            <CardContent>
                <Skeleton className="h-12 w-3/4 mx-auto mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="flex justify-between items-center pt-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-24" />
      </footer>
    </div>
  );
}