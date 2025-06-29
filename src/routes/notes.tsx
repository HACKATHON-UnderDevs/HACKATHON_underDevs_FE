import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { z } from 'zod';
import {
  AppSidebar,
} from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/site-header';
import { ChevronLeft, Search, Plus, Settings, Trash, ArrowLeft } from 'lucide-react';
import { MantineProvider } from '@mantine/core';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Component Imports
import { NoteCard } from '@/components/notes/NoteCard';
import { NoteDetailView } from '@/components/notes/NoteDetailView';
import { NotesSkeleton } from '@/components/skeletons/NotesSkeleton';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useAuth } from '@clerk/clerk-react';
import { Note, Workspace } from '@/supabase/supabase';
import {
  getNotes,
  getNotesInWorkspace,
  createNote,
  updateNote,
  deleteNote,
} from '@/services/noteService';
import { getWorkspacesForUser } from '@/services/workspaceService';
import { SpotifyEmbed } from '@/components/spotify-embed';


// --- Template Data (will be replaced by API calls) ---

// Represents a single lecture note or document
export interface LectureNote {
  id: string;
  title: string;
  courseName: string;
  content: string; // JSON string from BlockNote
  summary?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isFavorite: boolean;
  category: string;
  tags: string[];
  collaborationId?: string;
  uploadedDocuments: Array<{
    id: string;
    name: string;
    type: 'pdf' | 'docx' | 'txt' | 'ppt';
    url: string;
  }>;
}

const notesSearchSchema = z.object({
  workspaceId: z.string().optional().catch(undefined),
  noteId: z.string().optional().catch(undefined),
});

// --- TanStack Route Definition ---
export const Route = createFileRoute('/notes')({
  validateSearch: notesSearchSchema,
  component: NotesPage,
});

export function NotesPage() {
  return (
    <SidebarProvider>
      <NotesPageContent />
    </SidebarProvider>
  );
}

function NotesPageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'personal' | 'workspace'>('all');
  const { workspaceId, noteId } = Route.useSearch();
  const supabase = useSupabase();
  const { userId } = useAuth();
  const navigate = useNavigate({ from: Route.fullPath });
  const { state: sidebarState } = useSidebar();


  const fetchNotes = useCallback(async () => {
    if (!supabase || !userId) return;
    setIsLoading(true);

    const fetchedNotes = workspaceId
      ? await getNotesInWorkspace(supabase, workspaceId)
      : await getNotes(supabase, userId);

    if (fetchedNotes) {
      setNotes(fetchedNotes);
      if (noteId && fetchedNotes.some(n => n.id === noteId)) {
        setSelectedNoteId(noteId);
      } else if (fetchedNotes.length > 0 && !noteId) {
        setSelectedNoteId(fetchedNotes[0].id);
        navigate({ search: (prev) => ({ ...prev, noteId: fetchedNotes[0].id }), replace: true });
      } else {
        setSelectedNoteId(null);
      }
    }
    setIsLoading(false);
  }, [supabase, userId, workspaceId, noteId, navigate]);


  const fetchWorkspaces = useCallback(async () => {
    if (!supabase || !userId) return;
    const userWorkspaces = await getWorkspacesForUser(supabase, userId);
    if (userWorkspaces) {
      setWorkspaces(userWorkspaces);
    }
  }, [supabase, userId]);

  useEffect(() => {
    fetchNotes();
    fetchWorkspaces();
  }, [fetchNotes, fetchWorkspaces]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase());
      if (workspaceId) return matchesSearch;

      const matchesFilter = filter === 'all' ||
        (filter === 'personal' && !note.workspace_id) ||
        (filter === 'workspace' && note.workspace_id);
      return matchesSearch && matchesFilter;
    });
  }, [notes, searchTerm, filter, workspaceId]);

  const selectedNote = useMemo(() => {
    return notes.find((note) => note.id === selectedNoteId);
  }, [notes, selectedNoteId]);

  const handleSelectNote = (id: string) => {
    setSelectedNoteId(id);
    navigate({
      search: (prev) => ({ ...prev, noteId: id }),
      replace: true,
    });
  };

  const handleUpdateNote = async (updatedNoteData: Partial<Note>) => {
    if (!selectedNoteId || !supabase) return;
    const updatedNote = await updateNote(supabase, selectedNoteId, updatedNoteData);
    if (updatedNote) {
      if (workspaceId && updatedNote.workspace_id !== workspaceId) {
        const newNotes = notes.filter((n) => n.id !== selectedNoteId);
        setNotes(newNotes);
        if (newNotes.length > 0) {
          handleSelectNote(newNotes[0].id);
        } else {
          setSelectedNoteId(null);
        }
      } else {
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note.id === selectedNoteId ? updatedNote : note
          )
        );
      }
    }
  };

  const handleCreateNewNote = async () => {
    if (!supabase || !userId) return;
    const newNoteData: Partial<Note> = {
      title: "Untitled Note",
      content: JSON.stringify([{ type: "paragraph", content: "" }]),
      owner_id: userId,
      workspace_id: workspaceId,
      metadata: { courseName: 'New Course' }
    };
    const newNote = await createNote(supabase, newNoteData);
    if (newNote) {
      setNotes(prev => [newNote, ...prev]);
      handleSelectNote(newNote.id);
    }
  };

  const handleDeleteNote = async (noteIdToDelete: string) => {
    if (!supabase) return;
    const { error } = await deleteNote(supabase, noteIdToDelete);
    if (!error) {
      const newNotes = notes.filter(n => n.id !== noteIdToDelete);
      setNotes(newNotes);
      if (selectedNoteId === noteIdToDelete) {
          if (newNotes.length > 0) {
            handleSelectNote(newNotes[0].id);
          } else {
            setSelectedNoteId(null);
            navigate({ search: (prev) => ({...prev, noteId: undefined }) });
          }
      }
    }
  }

  const isSidebarCollapsed = sidebarState === 'collapsed';

  if (isLoading) {
    return <NotesSkeleton />;
  }

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-col md:flex-row h-full md:h-[calc(100vh-3rem)]">
          <aside className={`w-full md:w-1/3 lg:w-1/4 p-4 border-r dark:border-gray-800 flex-col ${selectedNoteId ? 'hidden md:flex' : 'flex'} ${isSidebarCollapsed ? 'hidden' : 'flex'}`}>
            <header className="mb-4 flex-shrink-0">
              <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">My Notes</h1>
              <div className="relative mb-4">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              {!workspaceId && (
                <div className="flex items-center gap-2 mb-4">
                  <Button size="sm" variant={filter === 'all' ? 'secondary' : 'outline'} onClick={() => setFilter('all')}>All</Button>
                  <Button size="sm" variant={filter === 'personal' ? 'secondary' : 'outline'} onClick={() => setFilter('personal')}>Personal</Button>
                  <Button size="sm" variant={filter === 'workspace' ? 'secondary' : 'outline'} onClick={() => setFilter('workspace')}>Workspaces</Button>
                </div>
              )}
              <div className="flex items-center gap-2">
                {workspaceId ? (
                  <Button variant="outline" onClick={() => navigate({ to: '/workspace' })}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Workspace
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => navigate({ to: '/workspace' })}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Go to workspace
                  </Button>
                )}
                <Button onClick={handleCreateNewNote} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </div>
            </header>
            <div className="flex-1 space-y-3 overflow-y-auto">
              {filteredNotes.length > 0 ? filteredNotes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  workspaces={workspaces}
                  onSelectNote={handleSelectNote}
                  isSelected={note.id === selectedNoteId}
                  onDeleteNote={handleDeleteNote}
                />
              )) : (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">No notes found.</p>
              )}
            </div>
            <div className="flex-shrink-0 pt-4">
                <SpotifyEmbed />
            </div>
          </aside>

          <main className={`flex-1 p-4 md:p-6 flex flex-col ${selectedNoteId ? 'flex' : 'hidden md:flex'} ${isSidebarCollapsed ? 'w-full' : 'md:w-2/3 lg:w-3/4'}`}>
            {selectedNoteId && !selectedNote && (
               <div className="text-center py-10 flex flex-col items-center justify-center h-full">
                <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-300">Note not found</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">The selected note could not be found, or it is still loading.</p>
               </div>
            )}
            
            {selectedNoteId && (
              <button
                onClick={() => setSelectedNoteId(null)}
                className="md:hidden mb-4 flex items-center text-sm font-semibold text-gray-600 hover:text-gray-800"
                aria-label="Back to notes list"
              >
                <ChevronLeft size={18} className="mr-1" />
                Back to Notes
              </button>
            )}

            {selectedNote ? (
              <div className="flex-1 flex flex-col min-h-0">
                <MantineProvider>
                  <NoteDetailView
                    key={selectedNote.id}
                    note={selectedNote}
                    onUpdateNote={handleUpdateNote}
                    noteSettingsComponent={
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Note Settings</DialogTitle>
                            <DialogDescription>
                              Move this note to a different workspace.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="collaboration-group">
                                Workspace
                              </Label>
                              <Select
                                value={selectedNote.workspace_id || "none"}
                                onValueChange={(value) => {
                                  handleUpdateNote({
                                    workspace_id:
                                      value === "none" ? null : value,
                                  });
                                }}
                              >
                                <SelectTrigger id="collaboration-group">
                                  <SelectValue placeholder="Assign to a workspace" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">
                                    No Workspace
                                  </SelectItem>
                                  {workspaces.map((ws) => (
                                    <SelectItem key={ws.id} value={ws.id}>
                                      {ws.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {selectedNote.owner_id === userId && (
                              <div className="flex flex-col space-y-2">
                                <Label>Delete Note</Label>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                      <Trash className="h-4 w-4 mr-2" />
                                      Delete this note
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Are you absolutely sure?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will
                                        permanently delete your note and remove
                                        your data from our servers.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteNote(selectedNote.id)
                                        }
                                      >
                                        Continue
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    }
                  />
                </MantineProvider>
              </div>
            ) : (
              <div className="text-center py-10 flex flex-col items-center justify-center h-full">
                <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-300">Select a note</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Choose a note from the list to view or create a new one.</p>
              </div>
            )}
          </main>
        </div>
      </SidebarInset>
    </>
  );
}