// src/components/quiz/game/Leaderboard.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { GameParticipant } from "@/types/gamify";
import { Trophy, Star, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/utils/css";

interface LeaderboardProps {
  participants: GameParticipant[];
}

export function Leaderboard({ participants }: LeaderboardProps) {
  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);

  return (
    <Card className="w-full max-w-2xl bg-background/80 backdrop-blur-md">
      <CardHeader className="text-center">
        <Trophy className="mx-auto h-12 w-12 text-yellow-400" />
        <CardTitle className="text-3xl">Leaderboard</CardTitle>
        <CardDescription>Scores are being updated...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedParticipants.map((p, index) => (
            <motion.div
              key={p.user_id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg border",
                index === 0 && "bg-yellow-100/50 dark:bg-yellow-800/20 border-yellow-400",
                index === 1 && "bg-gray-200/50 dark:bg-gray-700/20 border-gray-400",
                index === 2 && "bg-orange-100/50 dark:bg-orange-800/20 border-orange-400"
              )}
            >
              <span className="font-bold text-xl w-8 text-center">{index + 1}</span>
              <Avatar>
                <AvatarImage src={p.avatar_url || ''} />
                <AvatarFallback>{p.username.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{p.username}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span>{p.score} pts</span>
                </div>
              </div>
              {p.streak && p.streak > 1 ? (
                <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Streak x{p.streak}
                </div>
              ) : (
                <div className="flex items-center text-sm text-red-600 dark:text-red-400 opacity-50">
                    <TrendingDown className="h-4 w-4 mr-1" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}