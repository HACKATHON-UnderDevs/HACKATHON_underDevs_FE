import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import {
  Plus,
  Users,
  FileText,
} from 'lucide-react';
import { CollaborationSkeleton } from '@/components/skeletons';
import { collaborations } from '@/data/collaborations';

export const Route = createFileRoute('/collaboration/')({ component: CollaborationPage });

function CollaborationPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1400);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <CollaborationSkeleton />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Collaborations</h2>
            <div className="flex gap-2">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Collaboration
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collaborations.map((collaboration) => (
              <Link to="/collaboration/$collaborationId" params={{ collaborationId: collaboration.id.toString() }} key={collaboration.id}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="h-6 w-6 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-lg leading-tight flex items-center gap-2">
                            {collaboration.name}
                          </CardTitle>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex -space-x-2 overflow-hidden">
                            {collaboration.members.map((member, index) => (
                                <img key={index} className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src={member} alt="" />
                            ))}
                        </div>
                        <div className='flex items-center'>
                            <FileText className="h-4 w-4 mr-2" />
                            <span>{collaboration.noteIds.length} {collaboration.noteIds.length === 1 ? 'Note' : 'Notes'}</span>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
