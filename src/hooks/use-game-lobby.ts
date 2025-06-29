/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/hooks/use-game-lobby.ts
import { useState, useEffect, useCallback, useRef } from 'react'
import { useGamifySupabase } from '@/contexts/GamifySupabaseContext'
import { useUser } from '@clerk/clerk-react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { GameSession, GameParticipant } from '@/types/gamify'
import { useNavigate } from '@tanstack/react-router'

export function useGameLobby(sessionId: string) {
  const supabase = useGamifySupabase()
  const { user } = useUser()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const navigate = useNavigate()

  const [session, setSession] = useState<GameSession | null>(null)
  const [participants, setParticipants] = useState<GameParticipant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isHost = session?.host_user_id === user?.id
  const allPlayersReady =
    participants.length > 1 && participants.every(p => p.is_ready)

  const fetchLobbyData = useCallback(async () => {
    if (!supabase || !user) return

    try {
      console.log('Fetching lobby data for session:', sessionId)
      
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .select('*, quizzes(title)')
        .eq('id', sessionId)
        .single()
      
      if (sessionError) {
        console.error('Session fetch error:', sessionError)
        throw new Error(sessionError.message)
      }
      if (!sessionData) throw new Error('Session not found.')
      
      console.log('Session data received:', sessionData)
      setSession(sessionData as GameSession)

      const { data: participantsData, error: participantsError } = await supabase
        .from('game_participants')
        .select(`
          id,
          session_id,
          user_id,
          score,
          joined_at,
          is_host,
          is_ready,
          final_rank,
          profiles(username, avatar_url)
        `)
        .eq('session_id', sessionId)
        .order('joined_at', { ascending: true })
      
      if (participantsError) {
        console.error('Participants fetch error:', participantsError)
        throw new Error(participantsError.message)
      }

      console.log('Participants data received:', participantsData)

      const formatted: GameParticipant[] = participantsData.map((p: any) => ({
        id: p.id,
        session_id: p.session_id,
        user_id: p.user_id,
        score: p.score ?? 0,
        joined_at: p.joined_at,
        is_host: p.is_host ?? false,
        is_ready: p.is_ready ?? false,
        final_rank: p.final_rank,
        username: p.profiles?.username ?? 'Player',
        avatar_url: p.profiles?.avatar_url,
      }))
      
      setParticipants(formatted)
    } catch (err: any) {
      console.error('Error fetching lobby data:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, user, sessionId])

  useEffect(() => {
    if (!supabase || !user) {
      setIsLoading(false)
      return
    }

    console.log('Setting up realtime for session:', sessionId, 'user:', user.id)
    fetchLobbyData()

    if (channelRef.current) {
      console.log('Cleaning up existing channel')
      channelRef.current.unsubscribe()
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    const channel = supabase
      .channel(`game-lobby-${sessionId}`, {
        config: { 
          presence: { key: user.id },
          broadcast: { self: true }
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_participants',
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          fetchLobbyData()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          const newSession = payload.new as GameSession
          setSession(current => current ? { ...current, ...newSession } : newSession)
          
          if (newSession.status === 'in_progress') {
            console.log('GAME IS STARTING! State updated.')
            // The incorrect navigation has been removed. The UI will now react to the status change.
            // navigate({ to: `/quiz/${sessionId}/game` });
          }
        }
      )

    channel.subscribe(async (status, err) => {
      console.log('Channel subscription status:', status, err)
      
      if (status === 'SUBSCRIBED') {
        try {
          await channel.track({
            user_id: user.id,
            username: user.fullName ?? 'Anonymous',
            avatar_url: user.imageUrl,
            online_at: new Date().toISOString(),
          })
        } catch (trackError) {
          console.error('Error tracking presence:', trackError)
        }
      } else if (status === 'CHANNEL_ERROR') {
        setError(`Could not connect to the lobby: ${err?.message || 'Unknown error'}`)
      } else if (status === 'TIMED_OUT') {
        setError('Connection timed out. Please refresh the page.')
      }
    })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [supabase, user, sessionId, fetchLobbyData, navigate])

  const toggleReady = async () => {
    if (!supabase || !user) return
    const self = participants.find(p => p.user_id === user.id)
    if (!self) return

    const { error } = await supabase
      .from('game_participants')
      .update({ is_ready: !self.is_ready })
      .eq('session_id', sessionId)
      .eq('user_id', user.id)

    if (error) {
      alert(`Error: ${error.message}`)
    }
  }

  const startGame = async () => {
    if (!supabase || !isHost || !allPlayersReady) {
      return
    }
    
    const { error } = await supabase
      .from('game_sessions')
      .update({ 
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .eq('id', sessionId)

    if (error) {
      alert(`Error: ${error.message}`)
    }
  }

  return {
    session,
    participants,
    isLoading,
    error,
    isHost,
    allPlayersReady,
    toggleReady,
    startGame,
  }
}