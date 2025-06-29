/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
// src/components/notes/NoteDetailView.tsx
import { useState, useEffect, useMemo, useRef } from "react";
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
import * as Y from "yjs";
import YPartyKitProvider from "y-partykit/provider";
import { useUser } from "@clerk/clerk-react";

const userColors = [
  "#ff6b6b",
  "#f06595",
  "#cc5de8",
  "#845ef7",
  "#5c7cfa",
  "#339af0",
  "#22b8cf",
  "#20c997",
  "#51cf66",
  "#94d82d",
  "#fcc419",
  "#ff922b",
  "#ff6b6b",
];

const getRandomColor = () =>
  userColors[Math.floor(Math.random() * userColors.length)];

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
  const { user } = useUser();
  const doc = useMemo(() => new Y.Doc(), []);
  const contentRestored = useRef(false);

  const provider = useMemo(() => {
    if (!note.id || !doc) return null;
    // TODO: Use a production-ready PartyKit URL
    return new YPartyKitProvider(
      "blocknote-dev.yousefed.partykit.dev",
      note.id,
      doc
    );
  }, [note.id, doc]);

  const editor = useCreateBlockNote(
    {
      collaboration: {
        provider: provider!,
        fragment: doc.getXmlFragment("document-store"),
        user: {
          name: user?.fullName || "Anonymous",
          color: getRandomColor(),
        },
      },
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
    },
    [provider, doc, user]
  );

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
    if (!editor || !initialContent || !provider || contentRestored.current) {
      return;
    }

    const onSync = (synced: boolean) => {
      if (synced && !contentRestored.current) {
        const yDocFragment = doc.getXmlFragment("document-store");

        if (yDocFragment.length === 0) {
          console.log("Restoring content from database...");
          editor.replaceBlocks(editor.document, initialContent);
        } else {
          console.log("Content already exists in collaboration document.");
        }
        contentRestored.current = true;
      }
    };

    provider.on("sync", onSync);
    provider.connect();

    // Reset contentRestored flag when note changes
    return () => {
      provider.off("sync", onSync);
      provider.disconnect();
      contentRestored.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id, editor, initialContent, provider, doc]);

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
