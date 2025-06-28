/* eslint-disable @typescript-eslint/no-unused-vars */
// src/routes/notes.tsx
import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/site-header';
import { ChevronLeft } from 'lucide-react';
import { MantineProvider } from '@mantine/core';
import { Button } from '@/components/ui/Button';

// Component Imports
import { NoteCard, NoteCardSkeleton } from '@/components/notes/NoteCard';
import { NoteDetailView, NoteDetailViewSkeleton } from '@/components/notes/NoteDetailView';

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
      {
        type: 'heading',
        level: 1,
        content: [{ type: 'text', text: 'Introduction to Neural Networks', styles: {} }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'A neural network is a series of algorithms that endeavors to recognize underlying relationships in a set of data through a process that mimics the way the human brain operates.',
            styles: {},
          },
        ],
      },
      {
        type: 'bulletListItem',
        content: [{ type: 'text', text: 'Consists of layers: input, hidden, and output.', styles: {} }],
      },
      {
        type: 'bulletListItem',
        content: [{ type: 'text', text: 'Each connection has a weight.', styles: {} }],
      },
    ]),
    summary: 'An overview of neural networks, their structure, and function.',
    createdAt: '2024-05-20T10:00:00Z',
    updatedAt: '2024-05-20T11:30:00Z',
    userId: 'user-123',
    uploadedDocuments: [
      { id: 'doc-1', name: 'lecture1_slides.ppt', type: 'ppt', url: '#' },
      { id: 'doc-2', name: 'research_paper_1.pdf', type: 'pdf', url: '#' },
    ],
  },
  {
    id: 'note-2',
    title: 'Data Structures: Trees and Graphs',
    courseName: 'Advanced Algorithms',
    content: JSON.stringify([
      { type: 'heading', level: 1, content: 'Trees and Graphs' },
      { type: 'paragraph', content: 'Exploring non-linear data structures.' }
    ]),
    summary: 'A look at trees and graphs as non-linear data structures.',
    createdAt: '2024-05-18T14:00:00Z',
    updatedAt: '2024-05-18T15:00:00Z',
    userId: 'user-123',
    uploadedDocuments: [
      { id: 'doc-3', name: 'assignment_3.docx', type: 'docx', url: '#' },
    ],
  },
  {
    id: 'note-3',
    title: 'Calculus I: Limits and Derivatives',
    courseName: 'Mathematics for Engineers',
    content: JSON.stringify([
      { type: 'heading', level: 1, content: 'Limits' },
      { type: 'paragraph', content: 'The concept of a limit is fundamental to calculus.' }
    ]),
    createdAt: '2024-05-15T09:00:00Z',
    updatedAt: '2024-05-15T10:30:00Z',
    userId: 'user-123',
    uploadedDocuments: [],
  },
];

// --- TanStack Route Definition ---
export const Route = createFileRoute('/notes')({
  component: NotesPage,
});

function NotesPage() {
  const [isLoading, setIsLoading] = useState(false); // Simulate loading state
  const [notes, setNotes] = useState<LectureNote[]>(mockLectureNotes);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    mockLectureNotes.length > 0 ? mockLectureNotes[0].id : null
  );

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