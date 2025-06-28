/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo, useEffect } from 'react';
import {
  AppSidebar,
} from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/site-header';
import { ChevronLeft, Search, Filter, Plus } from 'lucide-react';
import { MantineProvider } from '@mantine/core';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Component Imports
import { NoteCard, NoteCardSkeleton } from '@/components/notes/NoteCard';
import { NoteDetailView, NoteDetailViewSkeleton } from '@/components/notes/NoteDetailView';
import { NotesSkeleton } from '@/components/skeletons/NotesSkeleton';


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
  uploadedDocuments: Array<{
    id: string;
    name: string;
    type: 'pdf' | 'docx' | 'txt' | 'ppt';
    url: string;
  }>;
}

// Mock data to power the UI until the API is connected
export const mockLectureNotes: LectureNote[] = [
  {
    id: 'note-1',
    title: 'Week 1: Introduction to Neural Networks',
    courseName: 'AI Fundamentals',
    content: JSON.stringify([
      { type: 'heading', level: 1, content: 'Introduction to Neural Networks' },
      { type: 'paragraph', content: 'A neural network is a series of algorithms that...' },
    ]),
    category: 'AI',
    tags: ['neural-networks', 'deep-learning'],
    isFavorite: true,
    summary: 'An overview of neural networks.',
    createdAt: '2024-05-20T10:00:00Z',
    updatedAt: '2024-05-20T11:30:00Z',
    userId: 'user-123',
    uploadedDocuments: [
      { id: 'doc-1', name: 'lecture1_slides.ppt', type: 'ppt', url: '#' },
    ],
  },
  {
    id: 'note-2',
    title: 'Data Structures: Trees and Graphs',
    courseName: 'Advanced Algorithms',
    content: JSON.stringify([{ type: 'heading', level: 1, content: 'Trees and Graphs' }]),
    category: 'Algorithms',
    tags: ['data-structures', 'graphs'],
    isFavorite: false,
    summary: 'A look at non-linear data structures.',
    createdAt: '2024-05-18T14:00:00Z',
    updatedAt: '2024-05-18T15:00:00Z',
    userId: 'user-123',
    uploadedDocuments: [],
  },
];

const categories = ['All', 'AI', 'Algorithms', 'Mathematics', 'History'];

// --- TanStack Route Definition ---
export const Route = createFileRoute('/notes')({
  component: NotesPage,
});

function NotesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState<LectureNote[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setNotes(mockLectureNotes);
      // Select the first note by default if the list is not empty
      if (mockLectureNotes.length > 0) {
        setSelectedNoteId(mockLectureNotes[0].id);
      }
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [notes, searchTerm, selectedCategory]);

  const selectedNote = useMemo(() => {
    return notes.find((note) => note.id === selectedNoteId);
  }, [notes, selectedNoteId]);

  const handleSelectNote = (id: string) => {
    setSelectedNoteId(id);
  };

  const handleUpdateNote = (updatedNoteData: Partial<LectureNote>) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === selectedNoteId 
          ? { ...note, ...updatedNoteData, updatedAt: new Date().toISOString() } 
          : note
      )
    );
  };

  const handleCreateNewNote = () => {
    const newNote: LectureNote = {
      id: `note-${Date.now()}`,
      title: "Untitled Note",
      courseName: "New Course",
      content: '[]',
      category: 'Uncategorized',
      tags: [],
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'user-123', // Placeholder
      uploadedDocuments: []
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
  };

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
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <p className="text-gray-500 mt-2">Choose a note from the list to view or create a new one.</p>
              </div>
            )}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}