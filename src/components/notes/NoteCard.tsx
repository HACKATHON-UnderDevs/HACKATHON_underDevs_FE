// src/components/notes/NoteCard.tsx
import { cn } from "@/utils/css";
import { Trash } from 'lucide-react';
import type { Note, Workspace } from '@/supabase/supabase';
import { useAuth } from "@clerk/clerk-react";
import { Badge } from "@/components/ui/badge";
import { getContentSnippet } from "@/utils/noteUtils";

interface NoteCardProps {
  note: Note;
  workspaces: Workspace[];
  onSelectNote: (id: string) => void;
  isSelected: boolean;
  onDeleteNote: (id: string) => void;
}

export function NoteCard({ note, workspaces, onSelectNote, isSelected, onDeleteNote }: NoteCardProps) {
  const { userId } = useAuth();
  const contentSnippet = getContentSnippet(note.content);
  const workspace = workspaces.find(ws => ws.id === note.workspace_id);

  return (
    <div
      onClick={() => onSelectNote(note.id)}
      className={cn(
        "p-4 rounded-lg cursor-pointer transition-all duration-200 ease-in-out border-2",
        isSelected 
          ? "bg-blue-50 dark:bg-blue-950/50 border-blue-500 shadow-md" 
          : "bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700",
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-md font-semibold truncate text-gray-800 dark:text-gray-200 mr-2">
          {note.title}
        </h3>
        {note.owner_id === userId && (
          <button
              onClick={(e) => {
                  e.stopPropagation(); // prevent selecting the note
                  onDeleteNote(note.id);
              }}
              className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
              aria-label="Delete note"
          >
              <Trash className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
        {workspace ? (
          <Badge variant="secondary">{workspace.name}</Badge>
        ) : (
          <Badge variant="outline">Personal</Badge>
        )}
      </div>
      
      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
        {contentSnippet}
      </p>

      <div className="text-right text-xs text-gray-400 dark:text-gray-500 mt-3">
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