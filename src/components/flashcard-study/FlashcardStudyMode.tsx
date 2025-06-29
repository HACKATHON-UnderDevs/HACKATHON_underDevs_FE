import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  XCircle,
  Trophy,
  Clock,
  Shuffle,
  Eye,
  Brain,
  Target,
} from 'lucide-react';
import { SavedFlashcardSet, Flashcard } from '@/services/quiz-api-service';
import { toast } from 'sonner';

interface StudyProgress {
  cardId: string;
  isKnown: boolean;
  attempts: number;
  timeSpent: number;
}

interface FlashcardStudyModeProps {
  flashcardSet: SavedFlashcardSet;
  mode: 'study' | 'review';
  onBack: () => void;
  onModeSwitch: (newMode: 'study' | 'review') => void;
}

export function FlashcardStudyMode({
  flashcardSet,
  mode,
  onBack,
  onModeSwitch,
}: FlashcardStudyModeProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyProgress, setStudyProgress] = useState<StudyProgress[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([]);
  const [reviewQueue, setReviewQueue] = useState<Flashcard[]>([]);
  const [completedCards, setCompletedCards] = useState<string[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());

  // Initialize cards and progress
  useEffect(() => {
    const shuffled = [...flashcardSet.flashcards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setReviewQueue([...shuffled]);
    setStudyProgress(
      flashcardSet.flashcards.map((card) => ({
        cardId: card.id,
        isKnown: false,
        attempts: 0,
        timeSpent: 0,
      }))
    );
    setSessionStartTime(Date.now());
  }, [flashcardSet]);

  // Timer effect
  useEffect(() => {
    if (!showResults) {
      const timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showResults]);

  // Reset state when mode changes
  useEffect(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false); // Always start with question side in study mode
    setShowResults(false);
    setTimeElapsed(0);
    setCompletedCards([]);
    if (flashcardSet) {
      setReviewQueue([...shuffledCards]);
    }
  }, [mode, shuffledCards, flashcardSet]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMarkCard = (isKnown: boolean) => {
    const currentCard = reviewQueue[0];
    if (!currentCard) return;

    setStudyProgress((prev) =>
      prev.map((progress) =>
        progress.cardId === currentCard.id
          ? {
              ...progress,
              isKnown,
              attempts: progress.attempts + 1,
              timeSpent: progress.timeSpent + (Date.now() - sessionStartTime) / 1000,
            }
          : progress
      )
    );

    if (isKnown) {
      // Only remove from queue if marked as known
      setCompletedCards((prev) => [...prev, currentCard.id]);
      setReviewQueue((prev) => prev.slice(1));
      
      // Check if all cards are completed
      if (reviewQueue.length === 1) {
        setShowResults(true);
      }
    }
    // If "Don't Know" is pressed, card stays in queue (no action needed)
  };

  const handleNextCard = () => {
    if (mode === 'study' && currentCardIndex < shuffledCards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else if (mode === 'study' && currentCardIndex === shuffledCards.length - 1) {
      // Mark all cards as completed for study mode
      setStudyProgress((prev) =>
        prev.map((progress) => ({ ...progress, isKnown: true, attempts: 1 }))
      );
      setShowResults(true);
    }
  };

  const handlePreviousCard = () => {
    if (mode === 'study' && currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleShuffleCards = () => {
    const shuffled = [...flashcardSet.flashcards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    if (mode === 'review') {
      setReviewQueue([...shuffled]);
      setCompletedCards([]);
    } else {
      setCurrentCardIndex(0);
    }
    setIsFlipped(false);
    toast.success('Cards shuffled!');
  };

  const handleRestartStudy = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setStudyProgress((prev) =>
      prev.map((p) => ({ ...p, isKnown: false, attempts: 0, timeSpent: 0 }))
    );
    setShowResults(false);
    setTimeElapsed(0);
    setCompletedCards([]);
    setReviewQueue([...shuffledCards]);
    setSessionStartTime(Date.now());
  };

  const calculateStats = () => {
    const knownCards = studyProgress.filter((p) => p.isKnown).length;
    const totalAttempts = studyProgress.reduce((sum, p) => sum + p.attempts, 0);
    const accuracy = totalAttempts > 0 ? Math.round((knownCards / totalAttempts) * 100) : 0;
    const avgTimePerCard = studyProgress.length > 0 
      ? studyProgress.reduce((sum, p) => sum + p.timeSpent, 0) / studyProgress.length 
      : 0;

    return {
      knownCards,
      totalCards: studyProgress.length,
      accuracy,
      totalAttempts,
      avgTimePerCard,
    };
  };

  const currentCard = mode === 'study' ? shuffledCards[currentCardIndex] : reviewQueue[0];
  const progress =
    mode === 'study'
      ? ((currentCardIndex + 1) / shuffledCards.length) * 100
      : (completedCards.length / shuffledCards.length) * 100;
  const stats = calculateStats();

  if (showResults) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to AI Generation
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Trophy className="h-16 w-16 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl">
              {mode === 'study' ? 'Study Session' : 'Review Session'} Complete!
            </CardTitle>
            <CardDescription>
              Here are your results for "{flashcardSet.title}"
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-600">{stats.accuracy}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {stats.knownCards}/{stats.totalCards}
                </div>
                <div className="text-sm text-muted-foreground">Known</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{stats.totalAttempts}</div>
                <div className="text-sm text-muted-foreground">Attempts</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{formatTime(timeElapsed)}</div>
                <div className="text-sm text-muted-foreground">Time</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleRestartStudy} variant="outline" className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                {mode === 'study' ? 'Study Again' : 'Review Again'}
              </Button>
              <Button
                onClick={() => onModeSwitch(mode === 'study' ? 'review' : 'study')}
                variant="outline"
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                Switch to {mode === 'study' ? 'Review' : 'Study'}
              </Button>
              <Button onClick={onBack} className="flex-1">
                <Target className="h-4 w-4 mr-2" />
                Back to AI Generation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No cards available</p>
        <Button onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to AI Generation
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{flashcardSet.title}</h1>
            <p className="text-muted-foreground">
              {flashcardSet.subject} • {mode === 'study' ? 'Study Mode' : 'Review Mode'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onModeSwitch(mode === 'study' ? 'review' : 'study')}
          >
            {mode === 'study' ? <Brain className="h-4 w-4 mr-2" /> : <Target className="h-4 w-4 mr-2" />}
            {mode === 'study' ? 'Review Mode' : 'Study Mode'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleShuffleCards}>
            <Shuffle className="h-4 w-4 mr-2" />
            Shuffle
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {formatTime(timeElapsed)}
          </div>
          <Badge variant="outline">
            {mode === 'study'
              ? `${currentCardIndex + 1} of ${shuffledCards.length}`
              : `${completedCards.length} done, ${reviewQueue.length} remaining`}
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      {/* Main Card */}
      <Card
        className="min-h-[400px] cursor-pointer"
        onClick={mode === 'study' ? handleFlipCard : undefined}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {mode === 'study' ? `Card ${currentCardIndex + 1}` : 'Review Card'}
            </CardTitle>
            {mode === 'study' && (
              <Badge variant={isFlipped ? 'default' : 'outline'}>
                {isFlipped ? 'Answer' : 'Question'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="min-h-[200px] flex items-center justify-center">
              <div className="text-lg font-medium w-full">
                {mode === 'study' ? (
                  isFlipped ? (
                    <div className="space-y-4 text-center">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Question:</p>
                        <p className="text-lg text-gray-600">{currentCard.question}</p>
                      </div>
                      <div className="border-t pt-4 space-y-2">
                        <p className="text-sm text-muted-foreground">Answer:</p>
                        <p className="text-xl font-semibold text-blue-600">{currentCard.answer}</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-4">
                        Click to flip back
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 text-center">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Question:</p>
                        <p className="text-xl font-semibold">{currentCard.question}</p>
                      </div>
                      <div className="mt-8 p-4 bg-blue-50 rounded-lg border-2 border-dashed border-blue-200">
                        <p className="text-sm text-blue-600 font-medium">
                          🔄 Click anywhere on this card to reveal the answer
                        </p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="space-y-6 text-center">
                    <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                      <p className="text-sm text-muted-foreground font-medium">Question:</p>
                      <p className="text-lg font-semibold">{currentCard.question}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                      <p className="text-sm text-muted-foreground font-medium">Answer:</p>
                      <p className="text-lg font-semibold text-blue-700">{currentCard.answer}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Do you know this answer?
                    </p>
                  </div>
                )}
              </div>
            </div>

            {mode === 'review' && (
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => handleMarkCard(false)}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Don't Know
                </Button>
                <Button
                  onClick={() => handleMarkCard(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Know It
                </Button>
              </div>
            )}
          </div>

          {mode === 'study' && (
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePreviousCard}
                disabled={currentCardIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              {currentCardIndex === shuffledCards.length - 1 ? (
                <Button onClick={handleNextCard} className="bg-green-600 hover:bg-green-700">
                  <Trophy className="h-4 w-4 mr-2" />
                  Finish Study
                </Button>
              ) : (
                <Button variant="outline" onClick={handleNextCard}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}