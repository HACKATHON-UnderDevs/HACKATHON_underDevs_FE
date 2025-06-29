import { createFileRoute, useNavigate } from '@tanstack/react-router';
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
  Target,
  Clock,
  Shuffle,
  Eye,
} from 'lucide-react';
import { QuizAPIService, SavedFlashcardSet, Flashcard } from '@/services/quiz-api-service';
import { toast } from 'sonner';

export const Route = createFileRoute('/flashcard/$flashcardSetId')({
  component: FlashcardStudyPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      mode: (search.mode as string) || 'study',
    };
  },
});

interface StudyProgress {
  cardId: string;
  isKnown: boolean;
  attempts: number;
}

function FlashcardStudyPage() {
  const { flashcardSetId } = Route.useParams();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const mode = search.mode; // 'study' or 'review'
  
  const [flashcardSet, setFlashcardSet] = useState<SavedFlashcardSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyProgress, setStudyProgress] = useState<StudyProgress[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([]);
  const [reviewQueue, setReviewQueue] = useState<Flashcard[]>([]);
  const [completedCards, setCompletedCards] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Timer effect
  useEffect(() => {
    if (!showResults) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [showResults]);
  
  // Load flashcard set data
  useEffect(() => {
    const loadFlashcardSet = async () => {
      try {
        const setData = await QuizAPIService.getFlashcardSetWithCards(flashcardSetId);
        if (setData) {
          setFlashcardSet(setData);
          const shuffled = [...setData.flashcards].sort(() => Math.random() - 0.5);
          setShuffledCards(shuffled);
          setReviewQueue([...shuffled]);
          setStudyProgress(setData.flashcards.map(card => ({
            cardId: card.id,
            isKnown: false,
            attempts: 0
          })));
        } else {
          toast.error('Flashcard set not found');
          navigate({ to: '/ai-generation' });
        }
      } catch (error) {
        console.error('Error loading flashcard set:', error);
        toast.error('Failed to load flashcard set');
        navigate({ to: '/ai-generation' });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFlashcardSet();
  }, [flashcardSetId, navigate]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
  };
  
  const handleMarkCard = (isKnown: boolean) => {
    // Review mode: manage queue system
    const currentCard = reviewQueue[0];
    if (!currentCard) return;
    
    setStudyProgress(prev => 
      prev.map(progress => 
        progress.cardId === currentCard.id
          ? { ...progress, isKnown, attempts: progress.attempts + 1 }
          : progress
      )
    );
    
    if (isKnown) {
      // Remove from queue and add to completed
      setCompletedCards(prev => [...prev, currentCard.id]);
      setReviewQueue(prev => prev.slice(1));
    } else {
      // Move to back of queue
      setReviewQueue(prev => [...prev.slice(1), currentCard]);
    }
    
    // Check if all cards are completed
    if (reviewQueue.length === 1 && isKnown) {
      setShowResults(true);
    }
  };
  
  const handleCardSelect = (cardIndex: number) => {
    if (mode === 'study') {
      setCurrentCardIndex(cardIndex);
      setIsFlipped(false);
    } else {
      // In review mode, find the card in the queue or completed cards
      const selectedCard = shuffledCards[cardIndex];
      if (completedCards.includes(selectedCard.id)) {
        // Card is already completed, just show it
        const queueIndex = reviewQueue.findIndex(card => card.id === selectedCard.id);
        if (queueIndex === -1) {
          // Move completed card back to front of queue
          setReviewQueue(prev => [selectedCard, ...prev]);
          setCompletedCards(prev => prev.filter(id => id !== selectedCard.id));
        }
      } else {
        // Move card to front of queue
        setReviewQueue(prev => {
          const filtered = prev.filter(card => card.id !== selectedCard.id);
          return [selectedCard, ...filtered];
        });
      }
    }
  };
  
  const handlePreviousCard = () => {
    if (mode === 'study' && currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };
  
  const handleNextCard = () => {
    if (mode === 'study' && currentCardIndex < shuffledCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    } else if (mode === 'study' && currentCardIndex === shuffledCards.length - 1) {
      // Mark all cards as studied and show results
      setStudyProgress(prev => 
        prev.map(progress => ({ ...progress, isKnown: true, attempts: 1 }))
      );
      setShowResults(true);
    }
  };
  
  const handleShuffleCards = () => {
    if (!flashcardSet) return;
    
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
    setStudyProgress(prev => prev.map(p => ({ ...p, isKnown: false, attempts: 0 })));
    setShowResults(false);
    setTimeElapsed(0);
    setCompletedCards([]);
    if (flashcardSet) {
      setReviewQueue([...shuffledCards]);
    }
  };
  
  const switchMode = (newMode: string) => {
    // Reset all state when switching modes
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setStudyProgress(prev => prev.map(p => ({ ...p, isKnown: false, attempts: 0 })));
    setShowResults(false);
    setTimeElapsed(0);
    setCompletedCards([]);
    setCurrentPage(1);
    if (flashcardSet) {
      setReviewQueue([...shuffledCards]);
    }
    
    // Navigate without page reload
    navigate({ to: `/flashcard/${flashcardSetId}`, search: { mode: newMode } });
  };
  
  const calculateStats = () => {
    const knownCards = studyProgress.filter(p => p.isKnown).length;
    const totalAttempts = studyProgress.reduce((sum, p) => sum + p.attempts, 0);
    const accuracy = totalAttempts > 0 ? Math.round((knownCards / totalAttempts) * 100) : 0;
    
    return {
      knownCards,
      totalCards: studyProgress.length,
      accuracy,
      totalAttempts
    };
  };
  
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading flashcard set...</p>
        </div>
      </div>
    );
  }
  
  if (!flashcardSet) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p>Flashcard set not found</p>
          <Button onClick={() => navigate({ to: '/ai-generation' })} className="mt-4">
            Back to AI Generation
          </Button>
        </div>
      </div>
    );
  }
  
  const currentCard = mode === 'study' ? shuffledCards[currentCardIndex] : reviewQueue[0];
  const progress = mode === 'study' 
    ? ((currentCardIndex + 1) / shuffledCards.length) * 100
    : ((completedCards.length) / shuffledCards.length) * 100;
  const stats = calculateStats();
  
  if (showResults) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: '/ai-generation' })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to AI Generation
          </Button>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Trophy className="h-16 w-16 text-yellow-500" />
              </div>
              <CardTitle className="text-2xl">
                {mode === 'study' ? 'Study Session' : 'Review Session'} Complete!
              </CardTitle>
              <CardDescription>Here are your results for "{flashcardSet.title}"</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-600">{stats.accuracy}%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{stats.knownCards}/{stats.totalCards}</div>
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
              
              <div className="space-y-4">
                <h3 className="font-semibold">Card Review</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {shuffledCards.map((card) => {
                    const cardProgress = studyProgress.find(p => p.cardId === card.id);
                    return (
                      <div key={card.id} className="border rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          {cardProgress?.isKnown ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm mb-1">{card.question}</p>
                            <p className="text-xs text-muted-foreground">{card.answer}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Attempts: {cardProgress?.attempts || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={handleRestartStudy} variant="outline" className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {mode === 'study' ? 'Study Again' : 'Review Again'}
                </Button>
                <Button 
                  onClick={() => switchMode(mode === 'study' ? 'review' : 'study')} 
                  variant="outline" 
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Switch to {mode === 'study' ? 'Review' : 'Study'}
                </Button>
                <Button onClick={() => navigate({ to: '/ai-generation' })} className="flex-1">
                  <Target className="h-4 w-4 mr-2" />
                  Back to AI Generation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  if (!currentCard) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p>No cards available</p>
          <Button onClick={() => navigate({ to: '/ai-generation' })} className="mt-4">
            Back to AI Generation
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: '/ai-generation' })}
          >
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
            onClick={() => switchMode(mode === 'study' ? 'review' : 'study')}
          >
            <Eye className="h-4 w-4 mr-2" />
            {mode === 'study' ? 'Review Mode' : 'Study Mode'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShuffleCards}
          >
            <Shuffle className="h-4 w-4 mr-2" />
            Shuffle
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {formatTime(timeElapsed)}
          </div>
          <Badge variant="outline">
            {mode === 'study' 
              ? `${currentCardIndex + 1} of ${shuffledCards.length}${currentCardIndex === shuffledCards.length - 1 ? ' - Ready to finish!' : ''}`
              : `${completedCards.length} done, ${reviewQueue.length} remaining`
            }
          </Badge>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>
      
      <div className="max-w-4xl mx-auto">
        <Card className="min-h-[400px] cursor-pointer" onClick={mode === 'study' ? handleFlipCard : undefined}>
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
              <div className="min-h-[120px] flex items-center justify-center">
                <div className="text-lg font-medium">
                  {mode === 'study' ? (
                    isFlipped ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Answer:</p>
                        <p className="text-xl">{currentCard.answer}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Question:</p>
                        <p className="text-xl">{currentCard.question}</p>
                        <p className="text-sm text-muted-foreground mt-4">Click anywhere to flip</p>
                      </div>
                    )
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Question:</p>
                        <p className="text-xl">{currentCard.question}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Answer:</p>
                        <p className="text-xl">{currentCard.answer}</p>
                      </div>
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
                  <Button
                    onClick={handleNextCard}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Finish Study
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleNextCard}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Question List */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Questions</CardTitle>
            <CardDescription>
              Click on any question to jump to that card
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               <div className="grid gap-2">
                 {shuffledCards
                   .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                   .map((card, pageIndex) => {
                     const index = (currentPage - 1) * itemsPerPage + pageIndex;
                     const isCurrentCard = mode === 'study' 
                       ? index === currentCardIndex 
                       : reviewQueue[0]?.id === card.id;
                     const isCompleted = mode === 'review' && completedCards.includes(card.id);
                     
                     return (
                       <Button
                         key={card.id}
                         variant={isCurrentCard ? "default" : "outline"}
                         className={`justify-start text-left h-auto p-3 ${
                           isCompleted ? 'bg-green-50 border-green-200 text-green-700' : ''
                         }`}
                         onClick={() => handleCardSelect(index)}
                       >
                         <div className="flex items-center gap-3 w-full">
                           <div className="flex-shrink-0">
                             <Badge variant={isCurrentCard ? "secondary" : "outline"}>
                               {index + 1}
                             </Badge>
                           </div>
                           <div className="flex-1 min-w-0">
                             <p className="text-sm font-medium truncate">
                               {card.question}
                             </p>
                           </div>
                           {isCompleted && (
                             <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                           )}
                         </div>
                       </Button>
                     );
                   })}
               </div>
               
               {/* Pagination Controls */}
               {shuffledCards.length > itemsPerPage && (
                 <div className="flex items-center justify-between pt-4 border-t">
                   <div className="text-sm text-muted-foreground">
                     Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, shuffledCards.length)} of {shuffledCards.length} questions
                   </div>
                   <div className="flex items-center gap-2">
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                       disabled={currentPage === 1}
                     >
                       <ArrowLeft className="h-4 w-4" />
                     </Button>
                     <div className="flex items-center gap-1">
                       {Array.from({ length: Math.ceil(shuffledCards.length / itemsPerPage) }, (_, i) => i + 1)
                         .filter(page => {
                           const totalPages = Math.ceil(shuffledCards.length / itemsPerPage);
                           if (totalPages <= 7) return true;
                           if (page === 1 || page === totalPages) return true;
                           if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                           return false;
                         })
                         .map((page, index, array) => {
                           const prevPage = array[index - 1];
                           const showEllipsis = prevPage && page - prevPage > 1;
                           
                           return (
                             <div key={page} className="flex items-center">
                               {showEllipsis && (
                                 <span className="px-2 text-muted-foreground">...</span>
                               )}
                               <Button
                                 variant={currentPage === page ? "default" : "outline"}
                                 size="sm"
                                 className="w-8 h-8 p-0"
                                 onClick={() => setCurrentPage(page)}
                               >
                                 {page}
                               </Button>
                             </div>
                           );
                         })}
                     </div>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setCurrentPage(prev => Math.min(Math.ceil(shuffledCards.length / itemsPerPage), prev + 1))}
                       disabled={currentPage === Math.ceil(shuffledCards.length / itemsPerPage)}
                     >
                       <ArrowRight className="h-4 w-4" />
                     </Button>
                   </div>
                 </div>
               )}
             </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
