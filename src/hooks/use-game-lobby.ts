// src/hooks/use-game-lobby.ts
import { useState, useEffect, useCallback } from 'react';
import { useGamifySupabase } from '@/contexts/GamifySupabaseContext';
import { useUser } from '@clerk/clerk-react';
import { RealtimeChannel } from '@supabase/supabase-js';
import type { GameSession, GameParticipant } from '@/types/gamify';

// Define the shape of user presence data
type PresenceInfo = {
  user_id: string;
  username: string;
  avatar_url: string;
};

export function useGameLobby(sessionId: string) {
  const supabase = useGamifySupabase();
  const { user } = useUser();
  
  const [session, setSession] = useState<GameSession | null>(null);
  const [participants, setParticipants] = useState<GameParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isHost = session?.host_user_id === user?.id;
  // A game should require at least 2 players, and all must be ready.
  const allPlayersReady = participants.length > 1 && participants.every(p => p.is_ready);

  const fetchLobbyData = useCallback(async () => {
    if (!supabase || !user) return;
    
    try {
      // Fetch session details
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();
      
      if (sessionError || !sessionData) throw new Error(sessionError?.message || 'Session not found.');
      setSession(sessionData);

      const { data: participantsData, error: participantsError } = await supabase
        .from('game_participants')
        .select('*, profiles(username, avatar_url)') // Join with profiles table
        .eq('session_id', sessionId)
        .order('joined_at', { ascending: true });
        
      if (participantsError) throw new Error(participantsError.message);

      const formattedParticipants = participantsData.map((p: any) => ({
        ...p,
        username: p.profiles?.username || 'Player',
        avatar_url: p.profiles?.avatar_url,
        profiles: undefined, 
      }));
      
      setParticipants(formattedParticipants);
      
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching lobby data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user, sessionId]);

  useEffect(() => {
    if (!supabase || !user) {
      setIsLoading(false);
      return;
    };
    
    setIsLoading(true);
    fetchLobbyData();
    
    const channel: RealtimeChannel = supabase.channel(`game_session:${sessionId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // ** THE FIX: Attach all real-time listeners to the channel **

    // 1. Listen for participant changes (joins, leaves, ready status)
    channel.on(
      'postgres_changes',
      { 
        event: '*', // Listen for INSERT, UPDATE, DELETE
        schema: 'vibe_learning_gamify_quizz', 
        table: 'game_participants',
        filter: `session_id=eq.${sessionId}` 
      },
      (payload) => {
        console.log('Participant change received, refetching lobby:', payload);
        fetchLobbyData();
      }
    );
      
    // 2. Listen for game session changes (e.g., game status changing to 'active')
    channel.on(
      'postgres_changes', 
      { 
        event: 'UPDATE', 
        schema: 'vibe_learning_gamify_quizz', 
        table: 'game_sessions',
        filter: `session_id=eq.${sessionId}` 
      }, 
      (payload) => {
        console.log('Game session change received!', payload);
        const newSession = payload.new as GameSession;
        if (newSession.status === 'active') {
          // This is where you would navigate to the actual game screen
          console.log("GAME IS STARTING! Navigation would happen here.");
        }
        setSession(newSession);
      }
    );

    // 3. Subscribe to the channel to activate all listeners
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Track user presence once subscribed
        await channel.track({
          user_id: user.id,
          username: user.fullName || 'Anonymous',
          avatar_url: user.imageUrl,
        });
      }
    });

    // 4. Cleanup function to remove the channel and its listeners
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user, sessionId, fetchLobbyData]);
  
  const toggleReady = async () => {
    if (!supabase || !user) return;
    const currentUser = participants.find(p => p.user_id === user.id);
    if (!currentUser) return;

    await supabase
      .from('game_participants')
      .update({ is_ready: !currentUser.is_ready })
      .eq('session_id', sessionId)
      .eq('user_id', user.id);
  };

  const startGame = async () => {
    if (!supabase || !isHost) return;
    await supabase
      .from('game_sessions')
      .update({ status: 'active' })
      .eq('session_id', sessionId);
  };

  return { 
    session, 
    participants, 
    isLoading, 
    error, 
    isHost,
    allPlayersReady,
    toggleReady,
    startGame 
  };
}