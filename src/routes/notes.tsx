/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useMemo, useEffect } from 'react';
import { z } from 'zod';
import {
  AppSidebar,
} from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/site-header';
import { ChevronLeft, Search, Plus, Settings, Trash } from 'lucide-react';
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
});

// --- TanStack Route Definition ---
export const Route = createFileRoute('/notes')({
  validateSearch: notesSearchSchema,
  component: NotesPage,
});

function NotesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { workspaceId } = Route.useSearch();
  const supabase = useSupabase();
  const { userId } = useAuth();
  const navigate = useNavigate();

  const fetchNotes = async () => {
    if (!supabase || !userId) return;
    setIsLoading(true);

    const fetchedNotes = workspaceId
      ? await getNotesInWorkspace(supabase, workspaceId)
      : await getNotes(supabase);

    if (fetchedNotes) {
      setNotes(fetchedNotes);
      if (fetchedNotes.length > 0) {
        setSelectedNoteId(fetchedNotes[0].id);
      } else {
        setSelectedNoteId(null);
      }
    }
    setIsLoading(false);
  };

  const fetchWorkspaces = async () => {
    if (!supabase || !userId) return;
    const userWorkspaces = await getWorkspacesForUser(supabase, userId);
    if (userWorkspaces) {
      setWorkspaces(userWorkspaces);
    }
  };

  useEffect(() => {
    fetchNotes();
    fetchWorkspaces();
  }, [workspaceId, supabase, userId]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [notes, searchTerm]);

  const selectedNote = useMemo(() => {
    return notes.find((note) => note.id === selectedNoteId);
  }, [notes, selectedNoteId]);

  const handleSelectNote = (id: string) => {
    setSelectedNoteId(id);
  };

  const handleUpdateNote = async (updatedNoteData: Partial<Note>) => {
    if (!selectedNoteId || !supabase) return;
    const updatedNote = await updateNote(supabase, selectedNoteId, updatedNoteData);
    if (updatedNote) {
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === selectedNoteId ? updatedNote : note
        )
      );
    }
  };

  const handleCreateNewNote = async () => {
    if (!supabase || !userId) return;
    const newNoteData: Partial<Note> = {
      title: "Untitled Note",
      content: '[]',
      owner_id: userId,
      workspace_id: workspaceId,
      metadata: { courseName: 'New Course' }
    };
    const newNote = await createNote(supabase, newNoteData);
    if (newNote) {
      setNotes(prev => [newNote, ...prev]);
      setSelectedNoteId(newNote.id);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!supabase) return;
    const { error } = await deleteNote(supabase, noteId);
    if (!error) {
      const newNotes = notes.filter(n => n.id !== noteId);
      setNotes(newNotes);
      if (selectedNoteId === noteId) {
          setSelectedNoteId(newNotes.length > 0 ? newNotes[0].id : null);
      }
    }
  }

  if (isLoading) {
    return <NotesSkeleton />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-col md:flex-row h-full md:h-[calc(100vh-3rem)]">
          <aside className={`w-full md:w-1/3 lg:w-1/4 p-4 border-r flex flex-col ${selectedNoteId ? 'hidden md:flex' : 'flex'}`}>
            <header className="mb-4">
              <h1 className="text-xl font-semibold text-gray-800 mb-4">My Notes</h1>
              <div className="relative mb-4">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => navigate({ to: '/notes' })}>All Notes</Button>
                 <Button onClick={handleCreateNewNote} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    New
                </Button>
              </div>
            </header>
            <div className="space-y-3 overflow-y-auto flex-grow">
              {filteredNotes.length > 0 ? filteredNotes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onSelectNote={handleSelectNote}
                  isSelected={note.id === selectedNoteId}
                  onDeleteNote={handleDeleteNote}
                />
              )) : (
                 <p className="text-center text-sm text-gray-500 mt-8">No notes found.</p>
              )}
            </div>
          </aside>

          <main className={`flex-1 w-full md:w-2/3 lg:w-3/4 p-4 md:p-8 overflow-y-auto ${selectedNoteId ? 'block' : 'hidden md:block'}`}>
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
              <>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedNote.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {((selectedNote.metadata as { courseName?: string })?.courseName) || 'No course'}
                    </p>
                  </div>
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
                          <Label htmlFor="collaboration-group">Workspace</Label>
                          <Select
                            value={selectedNote.workspace_id || 'none'}
                            onValueChange={(value) => {
                              handleUpdateNote({ workspace_id: value === 'none' ? undefined : value });
                            }}
                          >
                            <SelectTrigger id="collaboration-group">
                              <SelectValue placeholder="Assign to a workspace" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Workspace</SelectItem>
                              {workspaces.map((ws) => (
                                <SelectItem key={ws.id} value={ws.id}>
                                  {ws.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Label>Delete Note</Label>
                           <Button variant="destructive" onClick={() => handleDeleteNote(selectedNote.id)}>
                              <Trash className="h-4 w-4 mr-2" />
                              Delete this note
                            </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <MantineProvider>
                  <NoteDetailView
                    key={selectedNote.id}
                    note={selectedNote}
                    onUpdateNote={handleUpdateNote}
                  />
                </MantineProvider>
              </>
            ) : (
              <div className="text-center py-10 flex flex-col items-center justify-center h-full">
                <h2 className="text-2xl font-semibold text-gray-600">Select a note</h2>
                <p className="text-gray-500 mt-2">Choose a note from the list to view or create a new one.</p>
              </div>
            )}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}