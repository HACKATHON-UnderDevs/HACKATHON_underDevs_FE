// src/components/quiz/ParticipantList.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/badge";
import type { GameParticipant } from "@/types/gamify";
import { Crown } from "lucide-react";

interface ParticipantListProps {
  participants: GameParticipant[];
}

export function ParticipantList({ participants }: ParticipantListProps) {
  if (participants.length === 0) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-muted-foreground">
        <p>You're the first one here! Waiting for others to join...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {participants.map((participant) => (
        <div key={participant.user_id} className="flex flex-col items-center gap-2 p-4 border rounded-lg bg-background">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={participant.avatar_url} alt={participant.username} />
              <AvatarFallback>{participant.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            {participant.is_host && (
              <Crown className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500 fill-yellow-400 transform rotate-12" />
            )}
          </div>
          <p className="font-semibold text-center truncate w-full">{participant.username}</p>
          <Badge variant={participant.is_ready ? 'default' : 'outline'} className="transition-colors">
            {participant.is_ready ? 'Ready' : 'Not Ready'}
          </Badge>
        </div>
      ))}
    </div>
  );
}