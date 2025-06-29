// src/routes/quiz.tsx
import { createFileRoute, useNavigate, Link, Outlet, useRouterState } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useGamifySupabase } from '@/contexts/GamifySupabaseContext';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown, Gamepad2, Hash, Swords, Users, XCircle } from 'lucide-react';

// A "Not Found" component to be displayed when a sub-route of /quiz is not found.
function QuizNotFound() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 text-center p-8">
          <XCircle className="size-16 text-destructive" />
          <h1 className="text-2xl font-bold">Quiz Not Found</h1>
          <p className="max-w-md text-muted-foreground">
            The quiz session you are trying to access does not exist, has already
            ended, or you may not have permission to view it.
          </p>
          <Button asChild>
            <Link to="/quiz">Return to Quiz Lobby</Link>
          </Button>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// The route now points to the Layout component
export const Route = createFileRoute('/quiz')({
  component: QuizLayout,
  notFoundComponent: QuizNotFound,
});

// This new layout component wraps all routes under /quiz/*
function QuizLayout() {
  // Get the current path from the router state
  const { pathname } = useRouterState({ select: (s) => s.location });
  // Check if the current path is exactly `/quiz`
  const isIndex = pathname === Route.fullPath;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        {isIndex ? <QuizLobbyContent /> : <Outlet />}
      </SidebarInset>
    </SidebarProvider>
  );
}

function QuizCard({ quiz, onHost, disabled }: { quiz: { id: string; title: string, questions_count?: number }, onHost: (quizId: string) => void, disabled: boolean }) {
    return (
        <Card className="hover:border-primary transition-colors flex flex-col">
            <CardHeader className="flex-1">
                <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5 text-primary" />
                    {quiz.title}
                </CardTitle>
                <CardDescription>
                    {quiz.questions_count ?? 0} questions available
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button className="w-full" onClick={() => onHost(quiz.id)} disabled={disabled}>
                    <Crown className="mr-2 h-4 w-4" /> Host this Quiz
                </Button>
            </CardContent>
        </Card>
    );
}

// The content for the /quiz index page has been moved into this component
function QuizLobbyContent() {
  const [sessionCode, setSessionCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [quizzes, setQuizzes] = useState<{ id: string; title: string; questions_count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const supabase = useGamifySupabase();
  const { user } = useUser();

  useEffect(() => {
    if (!supabase || !user) return;
    
    supabase
      .from('quizzes')
      .select('id, title, questions(count)') 
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (data) {
          const formattedData = data.map((q: any) => ({
            ...q,
            questions_count: q.questions[0]?.count ?? 0,
            questions: undefined,
          }));
          setQuizzes(formattedData);
        }
        if (error) console.error("Error fetching quizzes:", error);
        setIsLoading(false);
      });
  }, [supabase, user]);

  const createGameSession = async (quizId: string) => {
    if (!quizId || !supabase) {
      alert('A quiz must be selected.');
      return;
    }
    setIsCreating(true);
    try {
      // Use supabase.functions.invoke to correctly call the edge function
      const { data, error } = await supabase.functions.invoke('create-game-session', {
        body: { quiz_id: quizId },
      });

      if (error) {
        throw error;
      }

      if (data.sessionId) {
        navigate({ to: `/quiz/${data.sessionId}` });
      } else {
        throw new Error(data.error || 'Failed to create session: Invalid response from function.');
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      alert(`Error creating session: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  const joinGameSession = async () => {
    const code = sessionCode.trim().toUpperCase();
    if (!code || !supabase) {
      alert('Please enter a valid session code.');
      return;
    }
    setIsJoining(true);
    try {
      // Implement joining a session via an edge function for security
      const { data, error } = await supabase.functions.invoke('join-game-session', {
        body: { session_code: code },
      });

      if (error) {
        // Handle specific errors, like function not found, gracefully
        if (error.message.includes("Not Found")) {
            throw new Error("The join-game-session function doesn't seem to exist. Or, check the session code.");
        }
        throw error;
      }

      if (data.sessionId) {
        navigate({ to: `/quiz/${data.sessionId}` });
      } else {
        throw new Error(data.error || 'Could not find a session with that code.');
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      alert(`Error joining session: ${errorMessage}`);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Multiplayer Quiz</h2>
          <p className="text-muted-foreground">Challenge your friends or create a new quiz!</p>
        </div>
      </div>
      
      <Tabs defaultValue="host" className="w-full max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="host"><Crown className="mr-2 h-4 w-4" /> Host a Game</TabsTrigger>
          <TabsTrigger value="join"><Users className="mr-2 h-4 w-4" /> Join a Game</TabsTrigger>
        </TabsList>
        <TabsContent value="host">
          <Card>
            <CardHeader>
              <CardTitle>Host a New Quiz</CardTitle>
              <CardDescription>Select one of your saved quizzes to start a new multiplayer session.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="grid md:grid-cols-2 gap-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
              ) : quizzes.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {quizzes.map((q) => (
                    <QuizCard key={q.id} quiz={q} onHost={createGameSession} disabled={isCreating} />
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">You don't have any quizzes yet.</p>
                    <Button variant="link" asChild>
                        <Link to="/ai-generation">Create a quiz with AI</Link>
                    </Button>
                </div>
              )}
              {isCreating && <p className="text-center text-primary animate-pulse mt-4">Creating session...</p>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="join">
          <Card>
            <CardHeader>
              <CardTitle>Join an Existing Game</CardTitle>
              <CardDescription>Enter the session code provided by the host to join the quiz lobby.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-code">Session Code</Label>
                <div className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-muted-foreground" />
                    <Input 
                        id="session-code" 
                        placeholder="ABCDEF"
                        value={sessionCode}
                        onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                        className="text-lg font-mono tracking-widest text-center"
                        maxLength={6}
                    />
                </div>
              </div>
              <Button className="w-full" onClick={joinGameSession} disabled={isJoining || !sessionCode}>
                {isJoining ? "Joining..." : <> <Swords className="mr-2 h-4 w-4" /> Join Game </>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}