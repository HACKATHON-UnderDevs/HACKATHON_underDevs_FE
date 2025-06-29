import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import {
  Brain,
  Sparkles,
  FileText,
  Target,
  Clock,
  Zap,
  RotateCcw,
  Play,
  Upload,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { AIGenerationSkeleton } from '@/components/skeletons';
import { QuizAPIService, SavedQuiz } from '@/services/quiz-api-service';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const Route = createFileRoute('/ai-generation')({ component: AIGenerationPage });

function AIGenerationPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [sourceText, setSourceText] = useState('');
  const [flashcardCount, setFlashcardCount] = useState('10');
  // Removed quizLength, difficulty, and questionType states
  const [quizTitle, setQuizTitle] = useState('');
  const [quizSubject, setQuizSubject] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [userQuizzes, setUserQuizzes] = useState<SavedQuiz[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Mock user ID - in real app, get from auth context
  const userId = 'user-123';

  useEffect(() => {
    const loadData = async () => {
      try {
        const quizzes = await QuizAPIService.getUserQuizzes(userId);
        setUserQuizzes(quizzes);
      } catch (error) {
        console.error('Error loading user quizzes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userId]);

  if (isLoading) {
    return <AIGenerationSkeleton />;
  }

  const recentFlashcards = [
    {
      id: 1,
      title: 'Biology Cell Structure',
      count: 15,
      subject: 'Biology',
      createdAt: '2024-01-15',
      accuracy: 87,
    },
    {
      id: 2,
      title: 'Math Derivatives',
      count: 12,
      subject: 'Mathematics',
      createdAt: '2024-01-14',
      accuracy: 92,
    },
    {
      id: 3,
      title: 'History WWII Events',
      count: 20,
      subject: 'History',
      createdAt: '2024-01-13',
      accuracy: 78,
    },
  ];

  const recentQuizzes = [
    {
      id: 1,
      title: 'Physics Motion Quiz',
      questions: 10,
      subject: 'Physics',
      createdAt: '2024-01-15',
      lastScore: 85,
    },
    {
      id: 2,
      title: 'Chemistry Bonds',
      questions: 8,
      subject: 'Chemistry',
      createdAt: '2024-01-14',
      lastScore: 90,
    },
  ];

  const handleGenerate = async () => {
    if (!sourceText.trim()) {
      toast.error('Please enter source material for the quiz');
      return;
    }

    // Validate minimum content length to prevent AI breakage
    if (sourceText.trim().length < 100) {
      toast.error('Source material must be at least 100 characters long for quality quiz generation');
      return;
    }

    // Check for meaningful content (not just repeated characters or spaces)
    const words = sourceText.trim().split(/\s+/).filter(word => word.length > 2);
    if (words.length < 20) {
      toast.error('Please provide more detailed content with at least 20 meaningful words');
      return;
    }

    if (!quizTitle.trim()) {
      toast.error('Please enter a title for your quiz');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setError(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 300);

      // Save quiz data to database first
      const savedQuiz = await QuizAPIService.saveQuizToDatabase({
        title: quizTitle,
        subject: quizSubject || undefined,
        sourceText,
        userId,
      });
      
      setGenerationProgress(100);
      
      // Update local state
      setUserQuizzes(prev => [savedQuiz, ...prev]);
      
      // Reset form
      setSourceText('');
      setQuizTitle('');
      setQuizSubject('');
      
      toast.success(`Quiz "${savedQuiz.title}" generated successfully!`);
      
      // Navigate to quiz page after a short delay
      setTimeout(() => {
        navigate({ to: `/quiz/${savedQuiz.id}` });
      }, 1000);
      
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError('Failed to generate quiz. Please try again.');
      toast.error('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">AI Content Generation</h2>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                AI Powered
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="flashcards" className="space-y-4">
            <TabsList>
              <TabsTrigger value="flashcards">Smart Flashcards</TabsTrigger>
              <TabsTrigger value="quizzes">Quiz Generation</TabsTrigger>
              <TabsTrigger value="history">Generation History</TabsTrigger>
            </TabsList>

            {/* Flashcards Generation */}
            <TabsContent value="flashcards" className="space-y-4">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        Generate Smart Flashcards
                      </CardTitle>
                      <CardDescription>
                        AI will analyze your content and create optimized flashcards for better retention
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="source-material">Source Material</Label>
                        <Textarea
                          id="source-material"
                          placeholder="Paste your study material here, or upload a document..."
                          value={sourceText}
                          onChange={(e) => setSourceText(e.target.value)}
                          className="min-h-[200px]"
                        />
                      </div>
                      <div className="flex gap-4">
                        <Button variant="outline" className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          Upload Document
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Import from Notes
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="flashcard-count">Number of Flashcards</Label>
                          <Select value={flashcardCount} onValueChange={setFlashcardCount}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5 flashcards</SelectItem>
                              <SelectItem value="10">10 flashcards</SelectItem>
                              <SelectItem value="15">15 flashcards</SelectItem>
                              <SelectItem value="20">20 flashcards</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {isGenerating && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Generating flashcards...</span>
                            <span>{generationProgress}%</span>
                          </div>
                          <Progress value={generationProgress} className="w-full" />
                        </div>
                      )}
                      <Button 
                        className="w-full" 
                        onClick={handleGenerate}
                        disabled={isGenerating || !sourceText.trim()}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        {isGenerating ? 'Generating...' : 'Generate Flashcards'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Recent Flashcards
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recentFlashcards.map((set) => (
                          <div key={set.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium">{set.title}</h4>
                              <Badge variant="outline">{set.count} cards</Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{set.subject}</span>
                              <span>{set.accuracy}% accuracy</span>
                            </div>
                            <div className="flex gap-1 mt-2">
                              <Button size="sm" variant="outline" className="h-6 text-xs">
                                <Play className="h-3 w-3 mr-1" />
                                Study
                              </Button>
                              <Button size="sm" variant="outline" className="h-6 text-xs">
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Review
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Quiz Generation */}
            <TabsContent value="quizzes" className="space-y-4">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Generate Practice Quiz
                      </CardTitle>
                      <CardDescription>
                        Create adaptive quizzes that adjust to your learning progress
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="quiz-title">Quiz Title</Label>
                          <Input
                            id="quiz-title"
                            placeholder="Enter a title for your quiz..."
                            value={quizTitle}
                            onChange={(e) => setQuizTitle(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quiz-subject">Subject (Optional)</Label>
                          <Input
                            id="quiz-subject"
                            placeholder="e.g., Biology, Math, History..."
                            value={quizSubject}
                            onChange={(e) => setQuizSubject(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="quiz-source">Source Material</Label>
                        <Textarea
                          id="quiz-source"
                          placeholder="Enter the content you want to be quizzed on... (minimum 100 characters, 20+ meaningful words)"
                          value={sourceText}
                          onChange={(e) => setSourceText(e.target.value)}
                          className={`min-h-[200px] ${
                            sourceText.length > 0 && sourceText.length < 100 
                              ? 'border-orange-300 focus:border-orange-500' 
                              : sourceText.length >= 100 
                              ? 'border-green-300 focus:border-green-500' 
                              : ''
                          }`}
                        />
                        <div className="flex justify-between items-center text-sm">
                          <span className={`${
                            sourceText.length < 100 
                              ? 'text-orange-600' 
                              : 'text-green-600'
                          }`}>
                            {sourceText.length}/100 characters minimum
                          </span>
                          <span className={`${
                            sourceText.trim().split(/\s+/).filter(word => word.length > 2).length < 20
                              ? 'text-orange-600'
                              : 'text-green-600'
                          }`}>
                            {sourceText.trim().split(/\s+/).filter(word => word.length > 2).length}/20 words minimum
                          </span>
                        </div>
                      </div>
                      {/* Removed Quiz Length, Difficulty, and Question Type fields */}
                      {isGenerating && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Generating quiz...</span>
                            <span>{generationProgress}%</span>
                          </div>
                          <Progress value={generationProgress} className="w-full" />
                        </div>
                      )}
                      <Button 
                        className="w-full" 
                        onClick={handleGenerate}
                        disabled={isGenerating || !sourceText.trim() || !quizTitle.trim()}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        {isGenerating ? 'Generating...' : 'Generate Quiz'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Recent Quizzes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {userQuizzes.length === 0 ? (
                          <div className="text-center text-muted-foreground py-8">
                            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No quizzes yet</p>
                            <p className="text-xs">Generate your first quiz to get started</p>
                          </div>
                        ) : (
                          userQuizzes.slice(0, 5).map((quiz) => (
                            <div key={quiz.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium">{quiz.title}</h4>
                                <Badge variant="outline">{quiz.question_count} Q</Badge>
                              </div>
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                <span>{quiz.subject || 'General'}</span>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="w-full h-6 text-xs"
                                onClick={() => navigate({ to: `/quiz/${quiz.id}` })}
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Take Quiz
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Generation History */}
            <TabsContent value="history" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Generation History</CardTitle>
                    <CardDescription>
                      Track your AI-generated content and performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[...recentFlashcards, ...recentQuizzes].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {'count' in item ? (
                              <Brain className="h-5 w-5 text-blue-500" />
                            ) : (
                              <Target className="h-5 w-5 text-green-500" />
                            )}
                            <div>
                              <h4 className="font-medium">{item.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {'count' in item ? `${item.count} flashcards` : `${item.questions} questions`} • {item.subject}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {'accuracy' in item ? `${item.accuracy}% accuracy` : `${item.lastScore}% score`}
                            </Badge>
                            <Button size="sm" variant="outline">
                              <Play className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
