import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { FileText, ArrowLeft } from 'lucide-react';
import { notes } from '@/data/notes';
import { collaborations } from '@/data/collaborations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';

export const Route = createFileRoute('/collaboration/$collaborationId')({
  component: CollaborationNotesPage,
});

function CollaborationNotesPage() {
    const { collaborationId } = Route.useParams();
    const collaboration = collaborations.find(c => c.id === parseInt(collaborationId));
    const sharedNotes = notes.filter(note => collaboration?.noteIds.includes(note.id));
  
    if (!collaboration) {
      return <div>Collaboration not found</div>;
    }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-muted-foreground">
                    COLLABORATIONS / {collaboration.name.toUpperCase()}
                </div>
                <Link to="/collaboration">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Collaborations
                    </Button>
                </Link>
            </div>


            <h1 className="text-3xl font-bold tracking-tight mb-2">Shared Notes in {collaboration.name}</h1>
            <p className="text-lg text-muted-foreground mb-8">
                A collection of notes shared in this collaboration.
            </p>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sharedNotes.map((note) => (
              <Link to="/notes/$noteId" params={{ noteId: note.id.toString() }} key={note.id}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-lg leading-tight flex items-center gap-2">
                            {note.title}
                          </CardTitle>
                          <Badge variant="secondary">{note.category}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {JSON.parse(note.content)[0].content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Last Modified: {note.lastModified}</span>
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