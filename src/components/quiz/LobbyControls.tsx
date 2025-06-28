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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full text-lg"
                onClick={onStartGame}
                disabled={!allPlayersReady || participants.length < 2}
              >
                <Play className="mr-2 h-5 w-5" />
                Start Game
              </Button>
            </div>
          </TooltipTrigger>
          {(!allPlayersReady || participants.length < 2) && (
            <TooltipContent>
              <p>
                {participants.length < 2 
                  ? "Waiting for at least one more player to join."
                  : "Waiting for all players to be ready."
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
    <Button size="lg" className="w-full sm:w-auto text-lg" onClick={onToggleReady}>
      {currentUser.is_ready ? (
        <>
          <X className="mr-2 h-5 w-5" /> Not Ready
        </>
      ) : (
        <>
          <Check className="mr-2 h-5 w-5" /> Ready Up
        </>
      )}
    </Button>
  );
}