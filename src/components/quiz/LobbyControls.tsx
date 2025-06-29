// src/components/quiz/LobbyControls.tsx
import { Button } from "@/components/ui/Button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUser } from "@clerk/clerk-react";
import { GameParticipant } from "@/types/gamify";
import { Play, Check, X } from 'lucide-react';

interface LobbyControlsProps {
  isHost: boolean;
  participants: GameParticipant[];
  allPlayersReady: boolean;
  onToggleReady: () => void;
  onStartGame: () => void;
}

export function LobbyControls({ isHost, participants, allPlayersReady, onToggleReady, onStartGame }: LobbyControlsProps) {
  const { user } = useUser();
  const currentUser = participants.find(p => p.user_id === user?.id);

  if (isHost) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-64 text-lg font-bold shadow-lg transform hover:scale-105 transition-transform"
                onClick={onStartGame}
                disabled={!allPlayersReady || participants.length < 2}
              >
                <Play className="mr-2 h-6 w-6" />
                Start Game
              </Button>
            </div>
          </TooltipTrigger>
          {(!allPlayersReady || participants.length < 2) && (
            <TooltipContent>
              <p className="text-sm">
                {participants.length < 2 
                  ? "At least 2 players are needed to start."
                  : "All players must be ready to start."
                }
              </p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (!currentUser) return null;

  return (
    <Button 
      size="lg" 
      className="w-full sm:w-64 text-lg font-bold shadow-lg transform hover:scale-105 transition-transform"
      onClick={onToggleReady}
      variant={currentUser.is_ready ? "secondary" : "default"}
    >
      {currentUser.is_ready ? (
        <>
          <X className="mr-2 h-6 w-6" /> Not Ready
        </>
      ) : (
        <>
          <Check className="mr-2 h-6 w-6" /> Ready Up!
        </>
      )}
    </Button>
  );
}