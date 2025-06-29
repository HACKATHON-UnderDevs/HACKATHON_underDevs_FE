import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useStudySession } from '@/contexts/StudySessionContext';
import { Button } from './ui/Button';
import { Clock } from 'lucide-react';

function Countdown({ seconds }: { seconds: number }) {
    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return <span>{formatTime(seconds)}</span>;
}

export function SiteHeader() {
  const { activeStudySet, sessionSeconds, isDrawerOpen, setIsDrawerOpen } = useStudySession();
  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center justify-start gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-1">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <AppBreadcrumb />
        </div>
        <div className="flex items-center gap-2">
            {activeStudySet && !isDrawerOpen && (
                <Button variant="outline" size="sm" onClick={() => setIsDrawerOpen(true)}>
                    <Clock className="h-4 w-4 mr-2" />
                    <Countdown seconds={sessionSeconds} />
                </Button>
            )}
        </div>
      </div>
    </header>
  );
}
