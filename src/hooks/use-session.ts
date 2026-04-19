import { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from './use-game';
import { getSession, updateSession } from '../lib/api';
import { subscribeToSession } from '../lib/pusher';
import { getUserId } from '../lib/user-id';
import type { GameState } from '../lib/types';

export function useSession(sessionId: string) {
  const { state, dispatch, startGame, throwDart, setMultiplier, editDart, undo, newMatch } = useGame();
  const [userId] = useState(getUserId);
  const loadedRef = useRef(false);
  const isRemoteUpdate = useRef(false);
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    getSession(sessionId).then(session => {
      setSessionCode(session.code);
      if (session.gameState) {
        isRemoteUpdate.current = true;
        dispatch({ type: 'SYNC_STATE', state: session.gameState });
      }
    }).catch(err => {
      console.error('Failed to load session:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, [sessionId, dispatch]);

  useEffect(() => {
    const unsubscribe = subscribeToSession(sessionId, (gameState, updatedBy) => {
      if (updatedBy !== userId) {
        isRemoteUpdate.current = true;
        dispatch({ type: 'SYNC_STATE', state: gameState });
      }
    });
    return unsubscribe;
  }, [sessionId, dispatch, userId]);

  const syncToServer = useCallback((newState: GameState) => {
    updateSession(sessionId, newState, userId).catch(err => {
      console.error('Failed to sync:', err);
    });
  }, [sessionId, userId]);

  const prevStateRef = useRef<GameState | null>(null);
  useEffect(() => {
    if (!state.gameStarted && state.history.length === 0) return;
    if (prevStateRef.current === state) return;
    prevStateRef.current = state;

    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    syncToServer(state);
  }, [state, syncToServer]);

  return {
    state,
    userId,
    sessionCode,
    loading,
    throwDart,
    setMultiplier,
    editDart,
    undo,
    startGame,
    newMatch,
  };
}
