import { useEffect, useRef, useCallback } from 'react';
import { useGame } from './use-game';
import { getSession, updateSession } from '../lib/api';
import { subscribeToSession } from '../lib/pusher';
import { getUserId } from '../lib/user-id';
import type { GameState, GameSettings } from '../lib/types';

export function useSession(sessionId: string) {
  const { state, dispatch, startGame, throwDart, setMultiplier, editDart, newMatch } = useGame();
  const userId = useRef(getUserId());
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    getSession(sessionId).then(session => {
      if (session.gameState) {
        dispatch({ type: 'SYNC_STATE', state: session.gameState });
      }
    }).catch(err => {
      console.error('Failed to load session:', err);
    });
  }, [sessionId, dispatch]);

  useEffect(() => {
    const unsubscribe = subscribeToSession(sessionId, (gameState, updatedBy) => {
      if (updatedBy !== userId.current) {
        dispatch({ type: 'SYNC_STATE', state: gameState });
      }
    });
    return unsubscribe;
  }, [sessionId, dispatch]);

  const syncToServer = useCallback((newState: GameState) => {
    updateSession(sessionId, newState, userId.current).catch(err => {
      console.error('Failed to sync:', err);
    });
  }, [sessionId]);

  const syncThrow = useCallback((baseValue: number, multiplier: 'S' | 'D' | 'T') => {
    throwDart(baseValue, multiplier);
  }, [throwDart]);

  const syncEdit = useCallback((index: number, value: number, multiplier: 'S' | 'D' | 'T') => {
    editDart(index, value, multiplier);
  }, [editDart]);

  const syncStartGame = useCallback((names: string[], settings: GameSettings) => {
    startGame(names, settings);
  }, [startGame]);

  const syncNewMatch = useCallback(() => {
    newMatch();
  }, [newMatch]);

  // Sync state to server after every state change (except initial load)
  const prevStateRef = useRef<GameState | null>(null);
  useEffect(() => {
    if (!state.gameStarted && state.history.length === 0) return;
    if (prevStateRef.current === state) return;
    prevStateRef.current = state;
    syncToServer(state);
  }, [state, syncToServer]);

  return {
    state,
    userId: userId.current,
    throwDart: syncThrow,
    setMultiplier,
    editDart: syncEdit,
    startGame: syncStartGame,
    newMatch: syncNewMatch,
  };
}
