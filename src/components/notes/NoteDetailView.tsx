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
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  AIMenuController,
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
import { useSupabase } from "@/contexts/SupabaseContext";
import { uploadFile, getPublicUrl } from "@/services/storageService";
import { Button } from "../ui/Button";
import { History, Bot } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTheme } from "@/components/shared/ThemeProvider";

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
  noteSettingsComponent?: React.ReactNode;
}

type UserInfo = { id: string; name: string; color: string };
type HistoryItem = {
  user: UserInfo;
  timestamp: number;
  summary: string;
};

const getBlockText = (block: PartialBlock | undefined): string => {
  if (!block || !block.content) return "";

  if (Array.isArray(block.content)) {
    return block.content
      .map((inline: unknown) => {
        if (typeof inline === "string") {
          return inline;
        }
        if (typeof inline === "object" && inline !== null && "text" in inline) {
          return (inline as { text: string }).text;
        }
        return "";
      })
      .join("")
      .slice(0, 40); // Truncate for brevity
  }
  // For complex block content like tables or string content
  if (typeof block.content === "string") {
    return block.content.slice(0, 40);
  }
  return `[${block.type} content]`;
};

/**
 * Generates a brief summary of the changes between two document states.
 */
const generateSummary = (
  oldDoc: PartialBlock[],
  newDoc: PartialBlock[]
): string | null => {
  const oldBlocks = new Map(oldDoc.map((b) => [b.id, b]));
  const newBlocks = new Map(newDoc.map((b) => [b.id, b]));
  const changes: string[] = [];

  // Check for added/modified blocks
  for (const [id, newBlock] of newBlocks.entries()) {
    const oldBlock = oldBlocks.get(id);
    if (!oldBlock) {
      changes.push(`Added: "${getBlockText(newBlock)}"`);
    } else if (
      JSON.stringify(oldBlock.content) !== JSON.stringify(newBlock.content)
    ) {
      changes.push(`Modified: "${getBlockText(newBlock)}"`);
    }
    oldBlocks.delete(id); // handled
  }

  // Check for deleted blocks
  for (const [, oldBlock] of oldBlocks.entries()) {
    changes.push(`Deleted: "${getBlockText(oldBlock)}"`);
  }

  if (changes.length === 0) return null;
  if (changes.length > 2)
    return `${changes.slice(0, 2).join(", ")} and ${
      changes.length - 2
    } other changes.`;
  return changes.join(", ");
};

const NoteHeader = ({
  title,
  onTitleChange,
  children,
}: {
  title: string;
  onTitleChange: (newTitle: string) => void;
  children?: React.ReactNode;
}) => {
  const [editableTitle, setEditableTitle] = useState(title);

  const debouncedSave = useDebouncedCallback((newTitle: string) => {
    onTitleChange(newTitle);
    toast.success("Title updated!");
  }, 2000);

  useEffect(() => {
    setEditableTitle(title);
  }, [title]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableTitle(e.target.value);
    debouncedSave(e.target.value);
  };

  return (
    <div className="p-4 border-b flex justify-between items-center gap-4">
      <Input
        value={editableTitle}
        onChange={handleChange}
        placeholder="Untitled Note"
        className="text-2xl font-bold border-0 focus:ring-0 p-0 shadow-none h-auto flex-grow bg-transparent"
      />
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
};

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

export function NoteDetailView({
  note,
  onUpdateNote,
  noteSettingsComponent,
}: NoteDetailViewProps) {
  const { user } = useUser();
  const supabase = useSupabase();
  const { theme } = useTheme();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const doc = useMemo(() => new Y.Doc(), [note.id]);
  const contentRestored = useRef(false);
  const lastDocumentState = useRef<PartialBlock[] | null>(null);

  const aiExtension = useMemo(() => createAIExtension({ model }), []);

  // State for history tracking
  const [historyLog, setHistoryLog] = useState<HistoryItem[]>([]);
  const [users, setUsers] = useState<Map<number, UserInfo>>(new Map());
  const userActionTimers = useRef<Map<number, NodeJS.Timeout>>(new Map());

  const provider = useMemo(() => {
    if (!note.id || !doc) return null;
    // TODO: Use a production-ready PartyKit URL
    return new YPartyKitProvider(
      "blocknote-dev.yousefed.partykit.dev",
      note.id,
      doc
    );
  }, [note.id, doc]);

  useEffect(() => {
    if (!provider || !user) return;

    const awareness = provider.awareness;
    awareness.setLocalStateField("user", {
      name: user.fullName || "Anonymous",
      id: user.id,
      color: getRandomColor(),
    });

    const handleAwarenessChange = () => {
      const newUsers = new Map<number, UserInfo>();
      awareness.getStates().forEach((state, clientID) => {
        if (state.user) {
          newUsers.set(clientID, state.user);
        }
      });
      setUsers(newUsers);
    };

    awareness.on("change", handleAwarenessChange);
    handleAwarenessChange(); // Initial load

    return () => {
      awareness.off("change", handleAwarenessChange);
    };
  }, [provider, user]);

  // This effect synchronizes the shared Y.Array with the local React state for rendering.
  useEffect(() => {
    const historyArray = doc.getArray<HistoryItem>("note-history");
    const syncHistory = () => {
      setHistoryLog(historyArray.toArray());
    };

    historyArray.observe(syncHistory);
    syncHistory(); // Initial sync

    return () => {
      historyArray.unobserve(syncHistory);
    };
  }, [doc]);

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
      extensions: [aiExtension],
      uploadFile: async (file: File) => {
        if (!supabase) {
          toast.error("Connection not established. Cannot upload file.");
          // BlockNote expects a Promise rejection on failure
          return Promise.reject("Supabase client not available.");
        }
        if (!note.id) {
          toast.error("Note must be saved before uploading files.");
          return Promise.reject("Note ID is not available.");
        }

        const path = `${user?.id}/${note.id}/${file.name}-${new Date().toISOString()}`;

        try {
          await uploadFile(supabase, "notes", path, file);
          const publicUrl = getPublicUrl(supabase, "notes", path);
          return publicUrl;
        } catch (error) {
          console.error("File upload failed:", error);
          if (error instanceof Error) {
            toast.error(`Upload failed: ${error.message}`);
          }
          throw error; // Re-throw to let BlockNote know it failed
        }
      },
    },
    [provider, doc, user, supabase, note.id, aiExtension]
  );

  useEffect(() => {
    console.log(editor);
    if (!doc || users.size === 0 || !editor) return;

    const handleTransaction = (transaction: Y.Transaction) => {
      const originClientID = transaction.local
        ? doc.clientID
        : transaction.origin;

      if (!originClientID) return;

      const userWhoMadeChange = users.get(originClientID);

      if (userWhoMadeChange) {
        // If a timer already exists for this user, clear it.
        if (userActionTimers.current.has(originClientID)) {
          clearTimeout(userActionTimers.current.get(originClientID)!);
        }

        // Set a new timer to log the action after a pause in activity.
        const newTimer = setTimeout(() => {
          const newDoc = editor.document;
          const oldDoc = lastDocumentState.current;
          
          if (oldDoc) {
            const summary = generateSummary(oldDoc, newDoc);

            if (summary) {
              // Write the new history item to the shared Y.Array.
              const historyArray = doc.getArray<HistoryItem>("note-history");
              historyArray.unshift([
                {
                  user: userWhoMadeChange,
                  timestamp: Date.now(),
                  summary: summary,
                },
              ]);
            }
          }

          lastDocumentState.current = newDoc;
          userActionTimers.current.delete(originClientID);
        }, 1500); // 1.5 seconds of inactivity

        userActionTimers.current.set(originClientID, newTimer);
      }
    };

    doc.on("afterTransaction", handleTransaction);

    return () => {
      doc.off("afterTransaction", handleTransaction);
      // Clean up any pending timers when the component unmounts or deps change
      // eslint-disable-next-line react-hooks/exhaustive-deps
      userActionTimers.current.forEach((timer) => clearTimeout(timer));
    };
  }, [doc, users, editor]);

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
        lastDocumentState.current = editor.document;
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
  }, [note.id, editor, initialContent, provider, doc]);

  const handleEditorChange = () => {
    const newContent = JSON.stringify(editor.document, null, 2);
    onUpdateNote({ content: newContent });
  };

  // Debounce the editor change handler
  const debouncedEditorUpdate = useDebouncedCallback(handleEditorChange, 2000);

  return (
    <Sheet>
      <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl shadow-lg flex flex-col min-w-0">
        <NoteHeader
          title={note.title}
          onTitleChange={(newTitle) => onUpdateNote({ title: newTitle })}
        >
          <div className="flex items-center gap-2">
            {noteSettingsComponent}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Chat with AI
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>AI Chat</DialogTitle>
                  <DialogDescription>
                    Chat with the AI to get help with your note.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
            </SheetTrigger>
          </div>
        </NoteHeader>
        <div className="flex-grow p-4 overflow-y-auto">
          <BlockNoteView
            theme={theme === "dark" ? "dark" : "light"}
            editor={editor}
            onChange={debouncedEditorUpdate}
            slashMenu={false}
          >
            <SuggestionMenuWithAI editor={editor!} />
            <AIMenuController />
          </BlockNoteView>
        </div>
      </div>
      <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>History</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <Button
            onClick={() => {
              const historyArray = doc.getArray<HistoryItem>("note-history");
              // This deletes all items from the shared array, syncing across clients.
              historyArray.delete(0, historyArray.length);
            }}
            variant="outline"
            className="w-full"
          >
            Clear History
          </Button>
        </div>
        <div className="space-y-3 overflow-y-auto flex-grow p-4">
          {historyLog.length > 0 ? (
            historyLog.map((item, i) => (
              <div key={i} className="text-sm p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <span
                    style={{ color: item.user.color, fontWeight: "bold" }}
                  >
                    {item.user.name}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-1">{item.summary}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
              No recent changes.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
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
