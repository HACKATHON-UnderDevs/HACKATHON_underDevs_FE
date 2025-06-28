/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
// src/components/notes/NoteDetailView.tsx
import { useState, useEffect, useMemo, forwardRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useCreateBlockNote, BlockNoteViewRaw } from "@blocknote/react";
import type { PartialBlock } from "@blocknote/core";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, X } from 'lucide-react';
import type { LectureNote } from '@/routes/notes';

interface NoteDetailViewProps {
    note: LectureNote;
    onUpdateNote: (updatedNote: Partial<LectureNote>) => void;
}

const NoteHeader = ({ title, onTitleChange }: { title: string; onTitleChange: (newTitle: string) => void }) => {
    const [editableTitle, setEditableTitle] = useState(title);

    const debouncedSave = useDebouncedCallback((newTitle: string) => {
        onTitleChange(newTitle);
        toast.success("Title updated!");
    }, 1000);

    useEffect(() => {
        setEditableTitle(title);
    }, [title]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditableTitle(e.target.value);
        debouncedSave(e.target.value);
    };

    return (
        <div className="p-4 border-b">
            <Input
                value={editableTitle}
                onChange={handleChange}
                placeholder="Untitled Note"
                className="text-2xl font-bold border-0 focus:ring-0 p-0 shadow-none h-auto"
            />
        </div>
    );
};

export function NoteDetailView({ note, onUpdateNote }: NoteDetailViewProps) {
    const editor = useCreateBlockNote();

    // Memoize the initial content to prevent re-initialization on every render
    const initialContent = useMemo((): PartialBlock[] | undefined => {
        try {
            // Safely parse the content, defaulting to undefined if invalid
            if (note.content) {
                const parsed = JSON.parse(note.content);
                return Array.isArray(parsed) ? parsed : undefined;
            }
        } catch (e) {
            console.error("Failed to parse note content:", e);
        }
        return undefined; // Fallback
    }, [note.content]);

    // Replace content only when the note ID changes
    useEffect(() => {
        if (editor.document) { // Ensure editor is initialized
            if (initialContent) {
                editor.replaceBlocks(editor.document, initialContent);
            } else {
                // Clear editor if there's no content or it's invalid
                editor.replaceBlocks(editor.document, []);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [note.id, editor]);

    const handleEditorChange = () => {
        const newContent = JSON.stringify(editor.document, null, 2);
        onUpdateNote({ content: newContent });
    };

    // Debounce the editor change handler
    const debouncedEditorUpdate = useDebouncedCallback(handleEditorChange, 1500);

    return (
        <div className="bg-white rounded-xl shadow-lg flex flex-col h-full">
            <NoteHeader title={note.title} onTitleChange={(newTitle) => onUpdateNote({ title: newTitle })} />
            <div className="flex-grow p-4 overflow-y-auto">
                <BlockNoteViewRaw editor={editor} onChange={debouncedEditorUpdate} />
            </div>
            <footer className="p-4 border-t">
                <h4 className="text-sm font-semibold mb-2">Uploaded Documents</h4>
                <div className="flex flex-wrap gap-2">
                    {note.uploadedDocuments.map(doc => (
                        <Badge key={doc.id} variant="secondary" className="pl-2 pr-1">
                            <FileText className="h-3 w-3 mr-1.5" />
                            {doc.name}
                            <button className="ml-1.5 rounded-full hover:bg-gray-300 p-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                    <Button variant="outline" size="sm" className="text-xs h-6">
                        <Upload className="h-3 w-3 mr-1" />
                        Upload File
                    </Button>
                </div>
            </footer>
        </div>
    );
}

export function NoteDetailViewSkeleton() {
    return (
        <div className="bg-white rounded-xl shadow-lg flex flex-col h-full p-4 animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-6"></div>
            <div className="space-y-4 flex-grow">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
        </div>
    );
}