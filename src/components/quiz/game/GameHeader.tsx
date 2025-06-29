// src/components/quiz/game/GameHeader.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Progress } from "@/components/ui/progress";
import { GameState } from "@/types/gamify";
import { useUser } from "@clerk/clerk-react";
import { Star, BarChart, Clock, Trophy } from "lucide-react";
import { useMemo } from "react";

interface GameHeaderProps {
  gameState: GameState;
}

export function GameHeader({ gameState }: GameHeaderProps) {
  const { user } = useUser();

  const localPlayer = useMemo(() => 
    gameState.participants.find(p => p.user_id === user?.id),
    [gameState.participants, user?.id]
  );
  
  const rank = useMemo(() => {
    if (!localPlayer) return gameState.participants.length;
    const sortedParticipants = [...gameState.participants].sort((a, b) => b.score - a.score);
    return sortedParticipants.findIndex(p => p.user_id === localPlayer.user_id) + 1;
  }, [localPlayer, gameState.participants]);

  const progressPercentage = (gameState.questionNumber / gameState.totalQuestions) * 100;
  
  return (
    <header className="w-full">
      <div className="mb-2">
        <Progress value={progressPercentage} className="h-2" />
      </div>
      <div className="flex justify-between items-center gap-4 text-white p-2 rounded-lg bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg">
            <Trophy className="h-5 w-5 text-yellow-300" />
            <span className="font-bold text-lg">{rank}/{gameState.participants.length}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg">
            <Star className="h-5 w-5 text-yellow-300" />
            <span className="font-bold text-lg">{localPlayer?.score ?? 0}</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-sm">Question {gameState.questionNumber}/{gameState.totalQuestions}</p>
          <div className="text-3xl font-bold flex items-center gap-2">
            <Clock className="h-7 w-7"/>
            {gameState.timer}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg">
            <BarChart className="h-5 w-5 text-blue-300" />
            <span className="font-bold text-lg">Streak: {localPlayer?.streak ?? 0}</span>
          </div>
          <Avatar>
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback>{user?.firstName?.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}