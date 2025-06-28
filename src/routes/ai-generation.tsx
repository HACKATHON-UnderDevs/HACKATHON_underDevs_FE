import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
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
  Sparkles,
  Brain,
  FileText,
  Upload,
  Zap,
  Clock,
  Target,
  TrendingUp,
  Play,
  RotateCcw,
} from 'lucide-react';

export const Route = createFileRoute('/ai-generation')({ component: AIGenerationPage });

function AIGenerationPage() {
  const [sourceText, setSourceText] = useState('');
  const [flashcardCount, setFlashcardCount] = useState('10');
  const [quizLength, setQuizLength] = useState('5');
  const [difficulty, setDifficulty] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

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

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    // Simulate AI generation progress
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
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
                        <div className="space-y-2">
                          <Label htmlFor="difficulty">Difficulty Level</Label>
                          <Select value={difficulty} onValueChange={setDifficulty}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
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
                      <div className="space-y-2">
                        <Label htmlFor="quiz-source">Source Material</Label>
                        <Textarea
                          id="quiz-source"
                          placeholder="Enter the content you want to be quizzed on..."
                          value={sourceText}
                          onChange={(e) => setSourceText(e.target.value)}
                          className="min-h-[200px]"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="quiz-length">Quiz Length</Label>
                          <Select value={quizLength} onValueChange={setQuizLength}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5 questions</SelectItem>
                              <SelectItem value="10">10 questions</SelectItem>
                              <SelectItem value="15">15 questions</SelectItem>
                              <SelectItem value="20">20 questions</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quiz-difficulty">Difficulty</Label>
                          <Select value={difficulty} onValueChange={setDifficulty}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="question-type">Question Type</Label>
                          <Select defaultValue="mixed">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                              <SelectItem value="true-false">True/False</SelectItem>
                              <SelectItem value="short-answer">Short Answer</SelectItem>
                              <SelectItem value="mixed">Mixed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
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
                        disabled={isGenerating || !sourceText.trim()}
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
                        {recentQuizzes.map((quiz) => (
                          <div key={quiz.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium">{quiz.title}</h4>
                              <Badge variant="outline">{quiz.questions} Q</Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                              <span>{quiz.subject}</span>
                              <span>Score: {quiz.lastScore}%</span>
                            </div>
                            <Button size="sm" variant="outline" className="w-full h-6 text-xs">
                              <Play className="h-3 w-3 mr-1" />
                              Take Quiz
                            </Button>
                          </div>
                        ))}
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
