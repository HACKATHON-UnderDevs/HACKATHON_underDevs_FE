import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
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
  Loader2,
  File as FileIcon,
  X,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { AIGenerationSkeleton } from "@/components/skeletons";
import {
  QuizAPIService,
  SavedQuiz,
  SavedFlashcardSet,
} from "@/services/quiz-api-service";
import { useFlashcardGeneration } from "@/hooks/use-flashcard-generation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSupabase } from "@/contexts/SupabaseContext";
import { useAuth } from "@clerk/clerk-react";
import { createNote, getNotes } from "@/services/noteService";
import { Note } from "@/supabase/supabase";

export const Route = createFileRoute("/ai-generation")({
  component: AIGenerationPage,
});

function AIGenerationPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useSupabase();
  const { userId } = useAuth();

  const [sourceText, setSourceText] = useState("");
  const [flashcardCount, setFlashcardCount] = useState("10");
  const [quizCount, setQuizCount] = useState("5");
  const [quizTitle, setQuizTitle] = useState("");
  const [quizSubject, setQuizSubject] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [userQuizzes, setUserQuizzes] = useState<SavedQuiz[]>([]);
  const [userFlashcardSets, setUserFlashcardSets] = useState<
    SavedFlashcardSet[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [flashcardTitle, setFlashcardTitle] = useState("");
  const [flashcardSubject, setFlashcardSubject] = useState("");

  const {
    isGenerating: isGeneratingFlashcards,
    generateFlashcards,
  } = useFlashcardGeneration();

  // State for the new lecture note generation feature
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const [quizzes, flashcardSets, notes] = await Promise.all([
          QuizAPIService.getUserQuizzes(userId),
          QuizAPIService.getUserFlashcardSets(userId),
          supabase ? getNotes(supabase, userId) : Promise.resolve(null),
        ]);
        setUserQuizzes(quizzes);
        setUserFlashcardSets(flashcardSets);
        if (notes) {
          setRecentNotes(notes.slice(0, 3));
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setError("Failed to load initial data. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userId, supabase]);


  // Handler for when a user selects a file
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Main function to handle file upload, analysis, and note creation
  const handleGenerateNoteFromFile = async () => {
    if (!selectedFile || !supabase || !userId) {
      toast.error('Please select a file and ensure you are logged in.');
      return;
    }

    setIsGeneratingNote(true);
    toast.loading('Analyzing document and generating lecture guide...');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Step 1: Call the backend to get structured note content from the file
      const response = await fetch('http://localhost:8000/documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to analyze the document.');
      }

      const analysisResult = await response.json();

      const noteData: Partial<Note> = {
        title: selectedFile.name.replace(/\.[^/.]+$/, ""), // Remove file extension for title
        content: analysisResult.summary, // The backend now returns structured content here
        owner_id: userId,
        metadata: { source: 'ai-generated-document' }
      };

      // Step 2: Save the generated content as a new note in Supabase
      const newNote = await createNote(supabase, noteData);

      if (!newNote) {
        throw new Error("Failed to save the generated note to your account.");
      }

      toast.success('Lecture guide created successfully! Redirecting...');

      // Step 3: Redirect user to the notes page to see their new note
      navigate({ to: '/notes', search: { noteId: newNote.id } });

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsGeneratingNote(false);
      setSelectedFile(null); // Clear file selection
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (isLoading) {
    return <AIGenerationSkeleton />;
  }

  const handleGenerateFlashcards = async () => {
    if (!sourceText.trim()) {
      toast.error("Please enter source material for the flashcards");
      return;
    }

    if (sourceText.trim().length < 100) {
      toast.error(
        "Source material must be at least 100 characters long for quality flashcard generation"
      );
      return;
    }

    const words = sourceText
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 2);
    if (words.length < 20) {
      toast.error(
        "Please provide more detailed content with at least 20 meaningful words"
      );
      return;
    }

    if (!flashcardTitle.trim()) {
      toast.error("Please enter a title for your flashcard set");
      return;
    }

    try {
      const flashcards = await generateFlashcards({
        title: flashcardTitle,
        subject: flashcardSubject || undefined,
        sourceText,
        userId: userId || '',
        cardCount: parseInt(flashcardCount),
      });

      if (flashcards) {
        // Refresh flashcard sets
        const updatedFlashcardSets =
          await QuizAPIService.getUserFlashcardSets(userId || '');
        setUserFlashcardSets(updatedFlashcardSets);

        // Reset form
        setSourceText("");
        setFlashcardTitle("");
        setFlashcardSubject("");

        toast.success(
          `Flashcard set "${flashcardTitle}" generated successfully!`
        );
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
      toast.error("Failed to generate flashcards. Please try again.");
    }
  };

  const handleGenerateQuiz = async () => {
    if (!sourceText.trim()) {
      toast.error("Please enter source material for the quiz");
      return;
    }

    if (sourceText.trim().length < 100) {
      toast.error(
        "Source material must be at least 100 characters long for quality quiz generation"
      );
      return;
    }

    // Check for meaningful content (not just repeated characters or spaces)
    const words = sourceText
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 2);
    if (words.length < 20) {
      toast.error(
        "Please provide more detailed content with at least 20 meaningful words"
      );
      return;
    }

    if (!quizTitle.trim()) {
      toast.error("Please enter a title for your quiz");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setError(null);

    try {
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 300);

      const savedQuiz = await QuizAPIService.saveQuizToDatabase({
        title: quizTitle,
        subject: quizSubject || undefined,
        sourceText,
        userId: userId!,
        questionCount: parseInt(quizCount),
      });

      setGenerationProgress(100);

      // Update local state
      setUserQuizzes((prev) => [savedQuiz, ...prev]);

      // Reset form
      setSourceText("");
      setQuizTitle("");
      setQuizSubject("");

      toast.success(`Quiz "${savedQuiz.title}" generated successfully!`);

      // Navigate to quiz page after a short delay
      setTimeout(() => {
        navigate({ to: `/quiz/${savedQuiz.id}` });
      }, 1000);
    } catch (error) {
      console.error("Error generating quiz:", error);
      setError("Failed to generate quiz. Please try again.");
      toast.error("Failed to generate quiz. Please try again.");
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
            <h2 className="text-3xl font-bold tracking-tight">
              AI Content Generation
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                AI Powered
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="lecture-guide" className="space-y-4">
            <TabsList>
              <TabsTrigger value="lecture-guide">Lecture Guide</TabsTrigger>
              <TabsTrigger value="flashcards">Smart Flashcards</TabsTrigger>
              <TabsTrigger value="quizzes">Quiz Generation</TabsTrigger>
              <TabsTrigger value="history">Generation History</TabsTrigger>
            </TabsList>

            {/* Lecture Guide Generation */}
            <TabsContent value="lecture-guide" className="space-y-4">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Generate Lecture Guide from Document
                      </CardTitle>
                      <CardDescription>
                        Upload a PDF, DOCX, or PPTX file to have AI create a structured and detailed lecture note for you.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <input
                        id="file-upload"
                        aria-label="Upload a document"
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.docx,.pptx,.txt"
                        disabled={isGeneratingNote}
                      />
                      <div
                        className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 font-semibold">Click to upload a document</p>
                        <p className="text-sm text-muted-foreground">PDF, DOCX, PPTX, TXT</p>
                      </div>

                      {selectedFile && (
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                          <div className='flex items-center gap-2 truncate'>
                            <FileIcon className="h-4 w-4 shrink-0" />
                            <span className='truncate text-sm'>{selectedFile.name}</span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = "" }} disabled={isGeneratingNote}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      <Button
                        className="w-full"
                        onClick={handleGenerateNoteFromFile}
                        disabled={isGeneratingNote || !selectedFile}
                      >
                        {isGeneratingNote ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        {isGeneratingNote ? 'Generating...' : 'Generate Lecture Guide'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Recent Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recentNotes.length > 0 ? recentNotes.map((note) => (
                          <div key={note.id} className="p-3 border rounded-lg">
                            <h4 className="text-sm font-medium truncate mb-1">{note.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2">
                              Updated {new Date(note.updated_at).toLocaleDateString()}
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full h-6 text-xs"
                              onClick={() => navigate({ to: '/notes', search: { noteId: note.id } })}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              View Note
                            </Button>
                          </div>
                        )) : (
                          <p className='text-sm text-muted-foreground text-center'>No recent notes found.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

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
                        AI will analyze your content and create optimized
                        flashcards for better retention
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="flashcard-title">
                            Flashcard Set Title
                          </Label>
                          <Input
                            id="flashcard-title"
                            placeholder="Enter a title for your flashcard set..."
                            value={flashcardTitle}
                            onChange={(e) => setFlashcardTitle(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="flashcard-subject">
                            Subject (Optional)
                          </Label>
                          <Input
                            id="flashcard-subject"
                            placeholder="e.g., Biology, Math, History..."
                            value={flashcardSubject}
                            onChange={(e) =>
                              setFlashcardSubject(e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="source-material-flashcards">Source Material</Label>
                        <Textarea
                          id="source-material-flashcards"
                          placeholder="Enter the content you want to create flashcards from... (minimum 100 characters, 20+ meaningful words)"
                          value={sourceText}
                          onChange={(e) => setSourceText(e.target.value)}
                          className={`min-h-[200px] ${
                            sourceText.length > 0 && sourceText.length < 100
                              ? "border-orange-300 focus:border-orange-500"
                              : sourceText.length >= 100
                                ? "border-green-300 focus:border-green-500"
                                : ""
                          }`}
                        />
                        <div className="flex justify-between items-center text-sm">
                          <span
                            className={`${
                              sourceText.length < 100
                                ? "text-orange-600"
                                : "text-green-600"
                            }`}
                          >
                            {sourceText.length}/100 characters minimum
                          </span>
                          <span
                            className={`${
                              sourceText
                                .trim()
                                .split(/\s+/)
                                .filter((word) => word.length > 2).length < 20
                                ? "text-orange-600"
                                : "text-green-600"
                            }`}
                          >
                            {
                              sourceText
                                .trim()
                                .split(/\s+/)
                                .filter((word) => word.length > 2).length
                            }
                            /20 words minimum
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Upload Document
                        </Button>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          Import from Notes
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="flashcard-count">
                            Number of Flashcards
                          </Label>
                          <Select
                            value={flashcardCount}
                            onValueChange={setFlashcardCount}
                          >
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

                      {isGeneratingFlashcards && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Generating flashcards...</span>
                            <span>
                              {Math.round(isGeneratingFlashcards ? 50 : 0)}%
                            </span>
                          </div>
                          <Progress
                            value={isGeneratingFlashcards ? 50 : 0}
                            className="w-full"
                          />
                        </div>
                      )}
                      <Button
                        className="w-full"
                        onClick={handleGenerateFlashcards}
                        disabled={
                          isGeneratingFlashcards ||
                          !sourceText.trim() ||
                          !flashcardTitle.trim()
                        }
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        {isGeneratingFlashcards
                          ? "Generating..."
                          : "Generate Flashcards"}
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
                        {userFlashcardSets.length === 0 ? (
                          <div className="text-center text-muted-foreground py-8">
                            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No flashcard sets yet</p>
                            <p className="text-xs">
                              Generate your first flashcard set to get started
                            </p>
                          </div>
                        ) : (
                          userFlashcardSets.slice(0, 5).map((set) => (
                            <div key={set.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium">
                                  {set.title}
                                </h4>
                                <Badge variant="outline">
                                  {set.card_count} cards
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                <span>{set.subject || "General"}</span>
                              </div>
                              <div className="flex gap-1 mt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-xs"
                                  onClick={() =>
                                    navigate({ to: `/flashcard/${set.id}`, search: { mode: 'study' } })
                                  }
                                >
                                  <Play className="h-3 w-3 mr-1" />
                                  Study
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-xs"
                                  onClick={() =>
                                    navigate({ to: `/flashcard/${set.id}`, search: { mode: 'review' } })
                                  }
                                >
                                  <RotateCcw className="h-3 w-3 mr-1" />
                                  Review
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
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
                        Create adaptive quizzes that adjust to your learning
                        progress
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
                          <Label htmlFor="quiz-subject">
                            Subject (Optional)
                          </Label>
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
                              ? "border-orange-300 focus:border-orange-500"
                              : sourceText.length >= 100
                                ? "border-green-300 focus:border-green-500"
                                : ""
                          }`}
                        />
                        <div className="flex justify-between items-center text-sm">
                          <span
                            className={`${
                              sourceText.length < 100
                                ? "text-orange-600"
                                : "text-green-600"
                            }`}
                          >
                            {sourceText.length}/100 characters minimum
                          </span>
                          <span
                            className={`${
                              sourceText
                                .trim()
                                .split(/\s+/)
                                .filter((word) => word.length > 2).length < 20
                                ? "text-orange-600"
                                : "text-green-600"
                            }`}
                          >
                            {
                              sourceText
                                .trim()
                                .split(/\s+/)
                                .filter((word) => word.length > 2).length
                            }
                            /20 words minimum
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="quiz-count">
                            Number of Questions
                          </Label>
                          <Select
                            value={quizCount}
                            onValueChange={setQuizCount}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">3 questions</SelectItem>
                              <SelectItem value="5">5 questions</SelectItem>
                              <SelectItem value="10">10 questions</SelectItem>
                              <SelectItem value="15">15 questions</SelectItem>
                              <SelectItem value="20">20 questions</SelectItem>
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
                          <Progress
                            value={generationProgress}
                            className="w-full"
                          />
                        </div>
                      )}
                      <Button
                        className="w-full"
                        onClick={handleGenerateQuiz}
                        disabled={
                          isGenerating ||
                          !sourceText.trim() ||
                          !quizTitle.trim()
                        }
                      >
                        <Target className="h-4 w-4 mr-2" />
                        {isGenerating ? "Generating..." : "Generate Quiz"}
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
                            <p className="text-xs">
                              Generate your first quiz to get started
                            </p>
                          </div>
                        ) : (
                          userQuizzes.slice(0, 5).map((quiz) => (
                            <div
                              key={quiz.id}
                              className="p-3 border rounded-lg"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium">
                                  {quiz.title}
                                </h4>
                                <Badge variant="outline">
                                  {quiz.question_count} Q
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                <span>{quiz.subject || "General"}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full h-6 text-xs"
                                onClick={() =>
                                  navigate({ to: `/quiz/${quiz.id}` })
                                }
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
                      {userFlashcardSets.length === 0 &&
                      userQuizzes.length === 0 ? (
                        <div className="text-center text-muted-foreground py-12">
                          <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-medium mb-2">
                            No content generated yet
                          </h3>
                          <p className="text-sm mb-4">
                            Start by creating flashcards or quizzes to see your
                            generation history
                          </p>
                          <div className="flex gap-2 justify-center">
                            <Button variant="outline" size="sm">
                              <Brain className="h-4 w-4 mr-1" />
                              Create Flashcards
                            </Button>
                            <Button variant="outline" size="sm">
                              <Target className="h-4 w-4 mr-1" />
                              Generate Quiz
                            </Button>
                          </div>
                        </div>
                      ) : (
                        [
                          ...userFlashcardSets.slice(0, 3).map((set) => ({
                            id: set.id,
                            title: set.title,
                            subject: set.subject || "General",
                            count: set.card_count,
                            type: "flashcard" as const,
                          })),
                          ...userQuizzes.slice(0, 3).map((quiz) => ({
                            id: quiz.id,
                            title: quiz.title,
                            subject: quiz.subject || "General",
                            count: quiz.question_count,
                            type: "quiz" as const,
                          })),
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                {item.type === "flashcard" ? (
                                  <Brain className="h-4 w-4 text-primary" />
                                ) : (
                                  <Target className="h-4 w-4 text-primary" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium">{item.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {item.subject} • {item.count}{" "}
                                  {item.type === "flashcard"
                                    ? "cards"
                                    : "questions"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {item.type === "flashcard"
                                  ? "Flashcards"
                                  : "Quiz"}
                              </Badge>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() =>
                                  navigate({ 
                                    to: item.type === "flashcard" 
                                      ? `/flashcard/${item.id}` 
                                      : `/quiz/${item.id}`,
                                    search: item.type === "flashcard" 
                                      ? { mode: 'study' } 
                                      : undefined
                                  })
                                }
                              >
                                <Play className="h-4 w-4 mr-1" />
                                {item.type === "flashcard"
                                  ? "Study"
                                  : "Take Quiz"}
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
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