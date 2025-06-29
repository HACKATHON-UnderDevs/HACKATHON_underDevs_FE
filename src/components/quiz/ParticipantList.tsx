// src/components/quiz/ParticipantList.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/badge";
import type { GameParticipant } from "@/types/gamify";
import { Crown, User, Check, X } from "lucide-react";
import { cn } from "@/utils/css";

interface ParticipantListProps {
  participants: GameParticipant[];
}

export function ParticipantList({ participants }: ParticipantListProps) {
  if (participants.length === 0) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
        <p>You're the first one here! Waiting for others to join...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {participants.map((participant) => (
        <div key={participant.user_id} className="relative flex flex-col items-center gap-3 p-4 border rounded-xl bg-background shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          {participant.is_host && (
            <div className="absolute -top-2 -right-2 bg-yellow-400 p-1.5 rounded-full shadow-md">
                <Crown className="h-5 w-5 text-white" />
            </div>
          )}
          
          <Avatar className={cn("h-20 w-20 border-4", participant.is_ready ? "border-primary" : "border-muted")}>
            <AvatarImage src={participant.avatar_url || undefined} alt={participant.username} />
            <AvatarFallback className="text-2xl">
              {participant.username ? participant.username.charAt(0).toUpperCase() : <User />}
            </AvatarFallback>
          </Avatar>

          <div className="text-center">
              <p className="font-semibold text-base truncate w-full max-w-[150px]">{participant.username}</p>
              <p className="text-sm text-muted-foreground">Score: {participant.score}</p>
          </div>

          <Badge 
            variant={participant.is_ready ? 'default' : 'secondary'} 
            className={cn(
              "transition-all text-sm py-1 px-3",
              !participant.is_host && !participant.is_ready && "animate-pulse"
            )}
          >
            {participant.is_ready ? <Check className="mr-1.5 h-4 w-4" /> : <X className="mr-1.5 h-4 w-4" />}
            {participant.is_ready ? 'Ready' : 'Not Ready'}
          </Badge>
        </div>
      ))}
    </div>
  );
}