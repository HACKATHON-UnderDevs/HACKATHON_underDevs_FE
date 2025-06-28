/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
// src/components/notes/NoteDetailView.tsx
import { useState, useEffect, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";
import {
  BlockNoteEditor,
  PartialBlock,
  filterSuggestionItems,
} from "@blocknote/core";
import { en } from "@blocknote/core/locales";
import "@blocknote/core/fonts/inter.css";
import {
  useCreateBlockNote,
  FormattingToolbar,
  FormattingToolbarController,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  getFormattingToolbarItems,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  AIMenuController,
  AIToolbarButton,
  createAIExtension,
  createBlockNoteAIClient,
  getAISlashMenuItems,
} from "@blocknote/xl-ai";
import { en as aiEn } from "@blocknote/xl-ai/locales";
import "@blocknote/xl-ai/style.css";
import { createGroq } from "@ai-sdk/groq";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import type { Note } from "@/supabase/supabase";

// Use an "open" model such as llama, in this case via groq.com
const client = createBlockNoteAIClient({
    apiKey: import.meta.env.VITE_BLOCKNOTE_AI_SERVER_API_KEY,
    baseURL:
      import.meta.env.VITE_BLOCKNOTE_AI_SERVER_BASE_URL,
  });
   
  // Use an "open" model such as llama, in this case via groq.com
  const model = createGroq({
    // call via our proxy client
    ...client.getProviderSettings("groq"),
  })("llama-3.3-70b-versatile");

interface NoteDetailViewProps {
  note: Note;
  onUpdateNote: (updatedNote: Partial<Note>) => void;
}

const NoteHeader = ({
  title,
  onTitleChange,
}: {
  title: string;
  onTitleChange: (newTitle: string) => void;
}) => {
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

// Formatting toolbar with the `AIToolbarButton` added
function FormattingToolbarWithAI() {
  return (
    <FormattingToolbarController
      formattingToolbar={() => (
        <FormattingToolbar>
          {...getFormattingToolbarItems()}
          {/* Add the AI button */}
          <AIToolbarButton />
        </FormattingToolbar>
      )}
    />
  );
}

// Slash menu with the AI option added
function SuggestionMenuWithAI(props: { editor: BlockNoteEditor }) {
  return (
    <SuggestionMenuController
      triggerCharacter="/"
      getItems={async (query) =>
        filterSuggestionItems(
          [
            ...getDefaultReactSlashMenuItems(props.editor),
            // add the default AI slash menu items, or define your own
            ...getAISlashMenuItems(props.editor),
          ],
          query
        )
      }
    />
  );
}

export function NoteDetailView({ note, onUpdateNote }: NoteDetailViewProps) {
  const editor = useCreateBlockNote({
    dictionary: {
      ...en,
      ai: aiEn, // add default translations for the AI extension
    },
    // Register the AI extension
    extensions: [
      createAIExtension({
        model,
      }),
    ],
  });

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
    if (editor.document) {
      // Ensure editor is initialized
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
      <NoteHeader
        title={note.title}
        onTitleChange={(newTitle) => onUpdateNote({ title: newTitle })}
      />
      <div className="flex-grow p-4 overflow-y-auto">
        <BlockNoteView
          editor={editor}
          onChange={debouncedEditorUpdate}
          formattingToolbar={false}
          slashMenu={false}
          theme="light"
        >
          {/* Add the AI Command menu to the editor */}
          <AIMenuController />

          {/* We disabled the default formatting toolbar with `formattingToolbar=false` 
                    and replace it for one with an "AI button" (defined below). 
                    (See "Formatting Toolbar" in docs)
                    */}
          <FormattingToolbarWithAI />

          {/* We disabled the default SlashMenu with `slashMenu=false` 
                    and replace it for one with an AI option (defined below). 
                    (See "Suggestion Menus" in docs)
                    */}
          <SuggestionMenuWithAI editor={editor} />
        </BlockNoteView>
      </div>
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
