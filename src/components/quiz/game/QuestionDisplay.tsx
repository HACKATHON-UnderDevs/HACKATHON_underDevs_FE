// src/components/quiz/game/QuestionDisplay.tsx
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { GameState, QuizQuestion } from "@/types/gamify";
import { cn } from "@/utils/css";
import { motion, AnimatePresence } from "motion/react";
import { Check, X } from "lucide-react";

interface QuestionDisplayProps {
  question: QuizQuestion;
  gameState: GameState;
  onSelectAnswer: (answerIndex: number) => void;
}

export function QuestionDisplay({ question, gameState, onSelectAnswer }: QuestionDisplayProps) {
  const isAnswered = gameState.selectedAnswerIndex !== undefined;
  const isRevealing = gameState.phase === 'answer_reveal';

  const getButtonVariant = (index: number) => {
    if (!isRevealing) {
      return gameState.selectedAnswerIndex === index ? "default" : "outline";
    }
    if (index === question.correctOptionIndex) {
      return "default"; // Correct answer is always prominent
    }
    if (index === gameState.selectedAnswerIndex) {
      return "destructive"; // Wrong selected answer
    }
    return "outline";
  };

  const getIcon = (index: number) => {
    if (!isRevealing) return null;
    if (index === question.correctOptionIndex) {
      return <Check className="h-6 w-6" />;
    }
    if (index === gameState.selectedAnswerIndex) {
      return <X className="h-6 w-6" />;
    }
    return null;
  };

  return (
    <Card className="w-full max-w-4xl bg-background/70 backdrop-blur-sm text-center">
      <CardContent className="p-6 md:p-10">
        <motion.h2 
          key={question.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold mb-8"
        >
          {question.questionText}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {question.options.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  onClick={() => onSelectAnswer(index)}
                  disabled={isAnswered}
                  className={cn(
                    "w-full h-auto min-h-[5rem] text-lg p-4 justify-between whitespace-normal text-left",
                    isRevealing && index === question.correctOptionIndex && "bg-green-600 hover:bg-green-700",
                    isRevealing && index !== question.correctOptionIndex && "opacity-50"
                  )}
                  variant={getButtonVariant(index)}
                >
                  <span>{option}</span>
                  {getIcon(index)}
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {isRevealing && question.explanation && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg"
            >
                <h4 className="font-bold text-blue-800 dark:text-blue-300">Explanation</h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">{question.explanation}</p>
            </motion.div>
        )}
      </CardContent>
    </Card>
  );
}