// src/routes/quiz.$sessionId.tsx
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clipboard, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGameLobby } from '@/hooks/use-game-lobby';
import { ParticipantList } from '@/components/quiz/ParticipantList';
import { LobbyControls } from '@/components/quiz/LobbyControls';

export const Route = createFileRoute('/quiz/$sessionId')({
  component: GameLobby,
});

function GameLobby() {
  const { sessionId } = Route.useParams();
  const [copied, setCopied] = useState(false);
  
  const { 
    session, 
    participants, 
    isLoading, 
    error,
    isHost,
    allPlayersReady,
    toggleReady,
    startGame 
  } = useGameLobby(sessionId);
  
  const copyToClipboard = () => {
    if (session?.session_code) {
      navigator.clipboard.writeText(session.session_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-4 text-lg">Joining Session...</span>
      </div>
    );
  }

  if (error) {
     return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <p className="text-red-500 text-lg">Error: {error}</p>
        <Button onClick={() => window.location.href = '/quiz'}>Back to Lobby</Button>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="w-full max-w-4xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span>Waiting for players... ({participants.length}/{session?.max_participants})</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Session Code:</span>
                    <Badge variant="secondary" className="text-lg font-mono tracking-widest">{session?.session_code}</Badge>
                    <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ParticipantList participants={participants} />
              </CardContent>
            </Card>

            <div className="flex items-center justify-center">
              <LobbyControls 
                isHost={isHost} 
                participants={participants}
                allPlayersReady={allPlayersReady}
                onToggleReady={toggleReady}
                onStartGame={startGame}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}