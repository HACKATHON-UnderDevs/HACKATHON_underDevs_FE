/* eslint-disable @typescript-eslint/no-unused-vars */
// src/routes/notes.tsx
import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/site-header';
import {
  Search,
  Plus,
  Star,
  Archive,
  Filter,
  Trash2,
  Tag,
  Calendar,
  BookOpen,
  Edit3,
  Share2,
} from 'lucide-react';
import { NotesSkeleton } from '@/components/skeletons';

export const Route = createFileRoute('/notes')({ component: NotesPage });

function NotesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <NotesSkeleton />;
  }

  const notes = [
    {
      id: 1,
      title: 'Biology Chapter 5: Cell Structure',
      content: 'Key concepts about mitochondria, nucleus, and cell membrane...',
      category: 'Biology',
      tags: ['cells', 'organelles', 'exam-prep'],
      lastModified: '2024-01-15',
      isFavorite: true,
    },
    {
      id: 2,
      title: 'Math: Calculus Derivatives',
      content: 'Rules for finding derivatives, chain rule, product rule...',
      category: 'Mathematics',
      tags: ['calculus', 'derivatives', 'formulas'],
      lastModified: '2024-01-14',
      isFavorite: false,
    },
    {
      id: 3,
      title: 'History: World War II Timeline',
      content: 'Important dates and events during WWII...',
      category: 'History',
      tags: ['timeline', 'wwii', 'dates'],
      lastModified: '2024-01-13',
      isFavorite: true,
    },
  ];

  const categories = ['all', 'Biology', 'Mathematics', 'History', 'Physics', 'Chemistry'];

  const selectedNote = useMemo(() => {
    return notes.find((note) => note.id === selectedNoteId);
  }, [notes, selectedNoteId]);

  const handleSelectNote = (id: string) => {
    setSelectedNoteId(id);
  };

  const handleUpdateNote = (updatedNote: Partial<LectureNote>) => {
    // This function simulates updating a note in the local state.
    // Later, this will be an API call.
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === selectedNoteId ? { ...note, ...updatedNote, updatedAt: new Date().toISOString() } : note
      )
    );
  };

  // A placeholder for creating a new note
  const handleCreateNewNote = () => {
    const newNote: LectureNote = {
      id: `note-${Date.now()}`,
      title: "Untitled Note",
      courseName: "New Course",
      content: '[]',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'user-123', // Placeholder
      uploadedDocuments: []
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-col md:flex-row h-full md:h-[calc(100vh-100px)]">
            <aside className="w-full md:w-1/3 lg:w-1/4 p-4 border-r overflow-y-auto">
              <div className="space-y-4">
                <NoteCardSkeleton />
                <NoteCardSkeleton />
                <NoteCardSkeleton />
              </div>
            </aside>
            <main className="flex-1 w-full md:w-2/3 lg:w-3/4 p-4 md:p-8 overflow-y-auto">
              <NoteDetailViewSkeleton />
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-col md:flex-row h-full md:h-[calc(100vh-100px)]">
          <aside className={`w-full md:w-1/3 lg:w-1/4 p-4 border-r overflow-y-auto ${selectedNoteId ? 'hidden md:block' : 'block'}`}>
            <header className="mb-6">
              <h1 className="text-xl font-semibold text-gray-700">My Notes</h1>
              <Button onClick={handleCreateNewNote} className="w-full mt-3">
                + Create New Note
              </Button>
            </header>
            <div className="space-y-3">
              {notes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onSelectNote={handleSelectNote}
                  isSelected={note.id === selectedNoteId}
                />
              ))}
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
              <MantineProvider>
                <NoteDetailView
                  key={selectedNote.id}
                  note={selectedNote}
                  onUpdateNote={handleUpdateNote}
                />
              </MantineProvider>
            ) : (
              <div className="text-center py-10 flex flex-col items-center justify-center h-full">
                <h2 className="text-2xl font-semibold text-gray-600">Select a note</h2>
                <p className="text-gray-500 mt-2">Choose a note from the list to view its content, or create a new one.</p>
              </div>
            )}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}