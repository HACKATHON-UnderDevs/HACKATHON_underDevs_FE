// src/components/quiz/game/GameResults.tsx
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { GameParticipant } from "@/types/gamify";
import { Crown, Trophy, Repeat, Home } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";

interface GameResultsProps {
  participants: GameParticipant[];
}

export function GameResults({ participants }: GameResultsProps) {
  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);
  const podium = sortedParticipants.slice(0, 3);

  return (
    <div className="flex flex-col items-center justify-center text-center w-full">
        <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 10, stiffness: 100 }}
            className="mb-8"
        >
            <Crown className="h-24 w-24 text-yellow-400 drop-shadow-lg" />
            <h1 className="text-4xl font-bold mt-2">Game Over!</h1>
            <p className="text-muted-foreground text-lg">Here are the final results.</p>
        </motion.div>
        
        <Card className="w-full max-w-lg bg-background/80 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    Final Leaderboard
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {podium.map((p, index) => (
                        <motion.div
                            key={p.user_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.2 }}
                            className="flex flex-col items-center p-4 border rounded-lg bg-background"
                        >
                            <span className="text-2xl font-bold mb-2">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </span>
                            <Avatar className="h-16 w-16 mb-2">
                                <AvatarImage src={p.avatar_url || ''} />
                                <AvatarFallback>{p.username.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <p className="font-bold text-lg">{p.username}</p>
                            <p className="text-muted-foreground">{p.score} Points</p>
                        </motion.div>
                    ))}
                </div>
            </CardContent>
        </Card>

        <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-8 flex gap-4"
        >
            <Button size="lg" variant="outline">
                <Repeat className="mr-2 h-4 w-4" />
                Play Again
            </Button>
            <Button size="lg" asChild>
                <Link to="/quiz">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Lobby
                </Link>
            </Button>
        </motion.div>
    </div>
  );
}