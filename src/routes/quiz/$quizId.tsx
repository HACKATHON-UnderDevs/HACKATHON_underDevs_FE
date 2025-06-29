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
  CheckCircle,
  XCircle,
  Clock,
  Target,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { QuizAPIService, SavedQuiz } from '@/services/quiz-api-service';
import { toast } from 'sonner'

export const Route = createFileRoute('/quiz/$quizId')({
  component: QuizPage,
});

interface QuizAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
}

function QuizPage() {
  const { quizId } = Route.useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<SavedQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  
  // Timer effect
  useEffect(() => {
    if (!showResults && !isQuizCompleted) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [showResults, isQuizCompleted]);
  
  // Load quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const quizData = await QuizAPIService.getQuizWithQuestions(quizId);
        if (quizData) {
          setQuiz(quizData);
        } else {
          toast.error('Quiz not found');
          navigate({ to: '/ai-generation' });
        }
      } catch (error) {
        console.error('Error loading quiz:', error);
        toast.error('Failed to load quiz');
        navigate({ to: '/ai-generation' });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuiz();
  }, [quizId, navigate]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };
  
  const handleNextQuestion = () => {
    if (!quiz || !selectedAnswer) return;
    
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    
    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
    };
    
    setAnswers(prev => [...prev, newAnswer]);
    setSelectedAnswer('');
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsQuizCompleted(true);
      setShowResults(true);
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      // Remove the last answer and set it as selected
      const lastAnswer = answers[answers.length - 1];
      if (lastAnswer) {
        setSelectedAnswer(lastAnswer.selectedAnswer);
        setAnswers(prev => prev.slice(0, -1));
      }
    }
  };
  
  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer('');
    setShowResults(false);
    setIsQuizCompleted(false);
    setTimeElapsed(0);
  };
  
  const calculateScore = () => {
    const correctAnswers = answers.filter(answer => answer.isCorrect).length;
    return Math.round((correctAnswers / answers.length) * 100);
  };
  
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }
  
  if (!quiz) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p>Quiz not found</p>
          <Button onClick={() => navigate({ to: '/ai-generation' })} className="mt-4">
            Back to AI Generation
          </Button>
        </div>
      </div>
    );
  }
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  
  if (showResults) {
    const score = calculateScore();
    const correctCount = answers.filter(a => a.isCorrect).length;
    
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: '/ai-generation' })}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            
            <div className="max-w-6xl mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Trophy className="h-16 w-16 text-yellow-500" />
                  </div>
                  <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
                  <CardDescription>Here are your results for "{quiz.title}"</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-green-600">{score}%</div>
                    <div className="text-sm text-muted-foreground">Score</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{correctCount}/{quiz.questions.length}</div>
                    <div className="text-sm text-muted-foreground">Correct</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{formatTime(timeElapsed)}</div>
                    <div className="text-sm text-muted-foreground">Time</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Question Review</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {quiz.questions.map((question, index) => {
                      const answer = answers[index];
                      return (
                        <div key={question.id} className="border rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            {answer?.isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium mb-2">{question.question}</p>
                              <div className="space-y-1 text-sm">
                                <p className="text-green-600">✓ Correct: {question.correct_answer}</p>
                                {!answer?.isCorrect && (
                                  <p className="text-red-600">✗ Your answer: {answer?.selectedAnswer}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={handleRetakeQuiz} variant="outline" className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake Quiz
                  </Button>
                  <Button onClick={() => navigate({ to: '/ai-generation' })} className="flex-1">
                    <Target className="h-4 w-4 mr-2" />
                    Generate New Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                <h1 className="text-2xl font-bold">{quiz.title}</h1>
                <p className="text-muted-foreground">
                  {quiz.subject}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {formatTime(timeElapsed)}
              </div>
              <Badge variant="outline">
                {currentQuestionIndex + 1} of {quiz.questions.length}
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Question {currentQuestionIndex + 1}
                </CardTitle>
                <CardDescription className="text-base">
                  {currentQuestion.question}
                </CardDescription>
              </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    className={`w-full p-4 text-left border rounded-lg transition-colors ${
                      selectedAnswer === option
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedAnswer === option
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`}>
                        {selectedAnswer === option && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={handleNextQuestion}
                  disabled={!selectedAnswer}
                >
                  {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              </CardContent>
            </Card>
          </div>
    </div>
  );
}
