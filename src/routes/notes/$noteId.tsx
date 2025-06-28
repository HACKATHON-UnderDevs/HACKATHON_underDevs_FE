import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useRef } from 'react';
import {
  BlockNoteSchema,
  defaultBlockSpecs,
  BlockNoteEditor,
  filterSuggestionItems,
} from '@blocknote/core';
import {
  useCreateBlockNote,
  FormattingToolbarController,
  FormattingToolbar,
  SuggestionMenuController,
  getFormattingToolbarItems,
  getDefaultReactSlashMenuItems,
} from '@blocknote/react';
import {
  createAIExtension,
  createBlockNoteAIClient,
  AIMenuController,
  AIToolbarButton,
  getAISlashMenuItems,
} from '@blocknote/xl-ai';
import { createGroq } from '@ai-sdk/groq';
import { BlockNoteView } from '@blocknote/mantine';
import { en } from "@blocknote/core/locales";
import { en as aiEn } from "@blocknote/xl-ai/locales";

import '@blocknote/mantine/style.css';
import '@blocknote/xl-ai/style.css';

import { notes } from '@/data/notes';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spotify } from 'react-spotify-embed';

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
function SuggestionMenuWithAI(props: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: BlockNoteEditor<any, any, any>;
}) {
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

export const Route = createFileRoute('/notes/$noteId')({
  component: NotePage,
});

function NotePage() {
  const { noteId } = Route.useParams();
  // We'll use state to manage the note's content
  const [currentContent, setCurrentContent] = useState<string | undefined>(
    () => {
      const note = notes.find((n) => n.id === parseInt(noteId));
      return note?.content;
    }
  );

  const note = notes.find((n) => n.id === parseInt(noteId));

  // Refs and placeholders for features that need more context
  const handleFileUploadCallbackRef = useRef<(file: File) => Promise<string>>(
    (file: File) => {
      console.log('Uploading file:', file.name);
      return Promise.resolve('https://via.placeholder.com/150');
    }
  );

  const client = createBlockNoteAIClient({
    apiKey: import.meta.env.VITE_BLOCKNOTE_AI_SERVER_API_KEY,
    baseURL: import.meta.env.VITE_BLOCKNOTE_AI_SERVER_BASE_URL,
  });

  const model = createGroq({
    ...client.getProviderSettings('groq'),
  })('llama-3.3-70b-versatile');

  const schema = BlockNoteSchema.create({
    blockSpecs: {
      ...defaultBlockSpecs,
    },
  });

  const editor = useCreateBlockNote({
    schema,
    dictionary: {
      ...en,
      ai: aiEn, // add default translations for the AI extension
    },
    extensions: [
      createAIExtension({
        model: model,
      }),
    ],
    uploadFile: (file) => {
      if (handleFileUploadCallbackRef.current) {
        return handleFileUploadCallbackRef.current(file);
      }
      return Promise.reject('File upload handler not ready.');
    },
    initialContent: currentContent ? JSON.parse(currentContent) : undefined,
  });

  if (!note) {
    return <div>Note not found</div>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <main className="p-4 md:p-8">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              DASHBOARD / {note.category.toUpperCase()}
            </div>
            <Link to="/notes">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Notes
              </Button>
            </Link>
          </div>

          <h1 className="text-4xl font-bold tracking-tight mb-2">{note.title}</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Phasellus accumsan a augue et efficitur.
          </p>

          <div className="prose prose-stone dark:prose-invert max-w-none mb-12">
            <BlockNoteView
              editor={editor}
              theme="light"
              formattingToolbar={false}
              slashMenu={false}
              onChange={() => {
                if (editor) {
                  setCurrentContent(JSON.stringify(editor.document, null, 2));
                }
              }}
            >
                <AIMenuController />
                <FormattingToolbarWithAI />
                <SuggestionMenuWithAI editor={editor} />
            </BlockNoteView>
          </div>
          
          <div className="mb-12">
            <Spotify wide link="https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b?si=a278d259c3874345" />
          </div>

        </main>
      </SidebarInset>
    </SidebarProvider>
  );
} 