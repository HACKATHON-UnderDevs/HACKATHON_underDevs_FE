// src/components/notes/NoteCard.tsx
import { cn } from "@/utils/css";
import { BookOpen, Trash } from 'lucide-react';
import type { Note } from '@/supabase/supabase';

interface NoteCardProps {
  note: Note;
  onSelectNote: (id: string) => void;
  isSelected: boolean;
  onDeleteNote: (id: string) => void;
}

// Helper to get a plain text snippet from the BlockNote JSON content
const getContentSnippet = (content: string | undefined): string => {
  if (!content) return 'No content available.';
  try {
    const blocks = JSON.parse(content);
    const textBlocks = blocks
      .filter((block: { type: string; }) => block.type === 'paragraph' || block.type === 'heading')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((block: any) => 
        block.content?.map((inline: { text: string; }) => inline.text).join('') || ''
      );
    return textBlocks.join(' ').slice(0, 100) || 'No text content.';
  } catch {
    return 'Could not display content.';
  }
};

export function NoteCard({ note, onSelectNote, isSelected, onDeleteNote }: NoteCardProps) {
  const contentSnippet = getContentSnippet(note.content);
  const courseName = (note.metadata as { courseName?: string })?.courseName || 'No Course';

  return (
    <div
      onClick={() => onSelectNote(note.id)}
      className={cn(
        "p-4 rounded-lg cursor-pointer transition-all duration-200 ease-in-out border-2",
        isSelected ? "bg-blue-50 border-blue-500 shadow-md" : "bg-white hover:bg-gray-50 border-gray-200",
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-md font-semibold truncate text-gray-800 mr-2">
          {note.title}
        </h3>
        <button
            onClick={(e) => {
                e.stopPropagation(); // prevent selecting the note
                onDeleteNote(note.id);
            }}
            className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100"
            aria-label="Delete note"
        >
            <Trash className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center text-xs text-gray-500 mb-2">
        <BookOpen size={14} className="mr-1.5 flex-shrink-0" />
        <span className="truncate">{courseName}</span>
      </div>
      
      <p className="text-xs text-gray-600 line-clamp-2">
        {contentSnippet}
      </p>

      <div className="text-right text-xs text-gray-400 mt-3">
        {new Date(note.updated_at).toLocaleDateString()}
      </div>
    </div>
  );
}

export function NoteCardSkeleton() {
  return (
    <div className="p-4 rounded-lg border-2 border-gray-200 animate-pulse">
        <div className="h-5 bg-gray-300 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
    </div>
  );
}