// src/routes/quiz.$sessionId.tsx
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clipboard, Check, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGameLobby } from '@/hooks/use-game-lobby';
import { ParticipantList } from '@/components/quiz/ParticipantList';
import { LobbyControls } from '@/components/quiz/LobbyControls';

// Game-related imports
import { useGamePlay } from '@/hooks/use-game-play';
import { QuizGameSkeleton } from '@/components/skeletons/QuizGameSkeleton';
import { GameHeader } from '@/components/quiz/game/GameHeader';
import { QuestionDisplay } from '@/components/quiz/game/QuestionDisplay';
import { Leaderboard } from '@/components/quiz/game/Leaderboard';
import { GameResults } from '@/components/quiz/game/GameResults';
import { AnimatePresence, motion } from 'motion/react';

export const Route = createFileRoute('/quiz/$sessionId')({
  component: SessionPage,
});

function GamePage({ sessionId }: { sessionId: string }) {
  const { gameState, selectAnswer } = useGamePlay(sessionId);

  if (gameState.phase === 'loading') {
    return <QuizGameSkeleton />;
  }

  const renderContent = () => {
    switch (gameState.phase) {
      case 'get_ready':
        return (
          <motion.div
            key="get_ready"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center text-white"
          >
            <h1 className="text-6xl font-bold mb-4">Get Ready!</h1>
            <p className="text-8xl font-mono font-bold">{gameState.timer}</p>
          </motion.div>
        );
      case 'question':
      case 'answer_reveal':
        if (!gameState.currentQuestion) return null;
        return (
          <motion.div
            key={gameState.currentQuestion.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col items-center"
          >
            <QuestionDisplay
              question={gameState.currentQuestion}
              gameState={gameState}
              onSelectAnswer={selectAnswer}
            />
          </motion.div>
        );
      case 'leaderboard':
        return (
          <motion.div key="leaderboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Leaderboard participants={gameState.participants} />
          </motion.div>
        );
      case 'finished':
        return (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GameResults participants={gameState.participants} />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full bg-gradient-to-br from-indigo-500 to-purple-600 p-4 lg:p-6 overflow-hidden">
      {gameState.phase !== 'finished' && gameState.phase !== 'get_ready' && (
        <GameHeader gameState={gameState} />
      )}
      <main className="flex-1 flex flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
      </main>
    </div>
  );
}

function SessionPage() {
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

  // If session status is 'in_progress' or 'completed', render the game/results page
  if (session?.status === 'in_progress' || session?.status === 'completed') {
    return <GamePage sessionId={sessionId} />;
  }
  
  const copyToClipboard = () => {
    if (session?.session_code) {
      navigator.clipboard.writeText(session.session_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  if (isLoading) {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-4 text-lg">Joining Session...</span>
        </div>
    );
  }

  if (error) {
     return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4">
            <XCircle className="h-16 w-16 text-destructive" />
            <p className="text-red-500 text-lg">Error: {error}</p>
            <Button asChild>
                <Link to="/quiz">Back to Quizzes</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col h-full bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-950 p-4 lg:p-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <p className="text-sm text-muted-foreground">Quiz Lobby</p>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                    {session?.quizzes?.title || 'Loading Quiz...'}
                </h1>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border shadow-sm">
                <span className="text-sm font-medium">Session Code:</span>
                <span className="text-xl font-mono tracking-widest font-bold text-primary">{session?.session_code}</span>
                <Button variant="ghost" size="icon" onClick={copyToClipboard} aria-label="Copy session code">
                    {copied ? <Check className="h-5 w-5 text-green-500" /> : <Clipboard className="h-5 w-5 text-muted-foreground" />}
                </Button>
            </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 flex flex-col justify-center">
            <Card className="bg-background/70 backdrop-blur-sm w-full max-w-6xl mx-auto">
                <CardHeader>
                    <CardTitle>
                        Players ({participants.length}/{session?.max_participants ?? 8})
                    </CardTitle>
                    <CardDescription>
                        Waiting for players to join and get ready. The host will start the game when everyone is ready.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ParticipantList participants={participants} />
                </CardContent>
            </Card>
        </main>

        {/* Footer Controls */}
        <footer className="py-4 flex items-center justify-center">
            <LobbyControls 
            isHost={isHost} 
            participants={participants}
            allPlayersReady={allPlayersReady}
            onToggleReady={toggleReady}
            onStartGame={startGame}
            />
        </footer>
    </div>
  );
}