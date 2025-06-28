// src/routes/quiz.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Crown, Gamepad2, UserPlus, Swords, Loader2 } from 'lucide-react';
import { useGamifySupabase } from '@/contexts/GamifySupabaseContext';
import { useUser } from '@clerk/clerk-react';
import { SupabaseClient } from '@supabase/supabase-js';
import type { UserResource } from '@clerk/types';

export const Route = createFileRoute('/quiz')({
  component: QuizLobbyPage,
});

// This helper is still useful for the "Join Game" flow.
const ensureUserProfile = async (supabase: SupabaseClient<any, any, any>, user: UserResource) => {
  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    username: user.fullName || `${user.firstName} ${user.lastName}`.trim() || 'Anonymous Player',
    avatar_url: user.imageUrl,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error ensuring user profile:', error);
    throw new Error('Could not verify user profile. Please try again.');
  }
};


function QuizLobbyPage() {
  const [sessionCode, setSessionCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const supabase = useGamifySupabase();
  const { user } = useUser();

  const handleCreateGame = async () => {
    if (!supabase || !user) return;
    setIsLoading(true);

    try {
      // **THE FIX: Call the Edge Function**
      // This function is expected to handle user profile creation (upsert),
      // session creation, and adding the host as a participant atomically.
      // This is more secure and prevents race conditions.
      const { data, error } = await supabase.functions.invoke('create-game-session');

      if (error) throw error;
      if (!data.sessionId) throw new Error("Function did not return a session ID.");
      
      // Navigate to the new lobby on success
      navigate({ to: `/quiz/${data.sessionId}` });

    } catch (error: any) {
      console.error('Error creating game session via function:', error);
      alert(`Failed to create a new game: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async () => {
     if (!supabase || !user || !sessionCode) return;
     setIsLoading(true);

     try {
       await ensureUserProfile(supabase, user);

       const { data: session, error: sessionError } = await supabase
          .from('game_sessions')
          .select('session_id, status, max_participants')
          .eq('session_code', sessionCode.toUpperCase())
          .single();
      
       if (sessionError || !session) {
          throw new Error('Invalid session code. Please check the code and try again.');
       }
  
       if (session.status !== 'waiting') {
          throw new Error('This game is no longer accepting new players.');
       }
       
       // Optional: Check if the room is full before attempting to join
       const { count } = await supabase.from('game_participants').select('*', { count: 'exact' }).eq('session_id', session.session_id);
       if(count !== null && count >= session.max_participants) {
          throw new Error('This game lobby is already full.');
       }
       
       // Use upsert to prevent errors if user re-joins
       const { error: joinError } = await supabase
          .from('game_participants')
          .upsert({ session_id: session.session_id, user_id: user.id, is_host: false, is_ready: false }, { onConflict: 'session_id, user_id' });
  
       if (joinError) throw joinError;

       navigate({ to: `/quiz/${session.session_id}` });

     } catch (error: any) {
        console.error('Error joining game:', error);
        alert(`Failed to join game: ${error.message}`);
     } finally {
        setIsLoading(false);
     }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="w-full max-w-4xl space-y-8">
            <div className="text-center">
              <Swords className="mx-auto h-12 w-12 text-primary" />
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Multiplayer Quiz Arena
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Challenge your friends and test your knowledge!
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Join a Game
                  </CardTitle>
                  <CardDescription>
                    Enter a session code to join an existing game.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="session-code">Session Code</Label>
                    <Input
                      id="session-code"
                      placeholder="ABCDEF"
                      value={sessionCode}
                      onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                      className="text-center text-lg tracking-widest font-mono"
                      maxLength={6}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={handleJoinGame} disabled={isLoading || sessionCode.length < 6}>
                     {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Gamepad2 className="mr-2 h-4 w-4" />}
                    Join Game
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-primary border-2 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Crown className="h-5 w-5" />
                    Create a New Game
                  </CardTitle>
                  <CardDescription>
                    Start a new quiz session and invite others to join.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    You'll be the host. Once everyone has joined and is ready, you can start the game.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="default" onClick={handleCreateGame} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Crown className="mr-2 h-4 w-4" />}
                    Create New Game
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}