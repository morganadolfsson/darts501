// Drop into src/hooks/use-game.ts — replaces original.
// Adds `undo` and the new START_GAME signature (avatars + taglines).
import { useReducer } from 'react';
import { gameReducer, initialGameState } from '../lib/game-reducer';
import type { GameSettings } from '../lib/types';

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, undefined, initialGameState);

  return {
    state,
    dispatch,
    startGame: (names: string[], avatars: string[], taglines: string[], settings: GameSettings) =>
      dispatch({ type: 'START_GAME', names, avatars, taglines, settings }),
    throwDart: (baseValue: number, multiplier: 'S' | 'D' | 'T') =>
      dispatch({ type: 'THROW_DART', baseValue, multiplier }),
    setMultiplier: (m: 'S' | 'D' | 'T') => dispatch({ type: 'SET_MULTIPLIER', multiplier: m }),
    editDart: (index: number, value: number, m: 'S' | 'D' | 'T') =>
      dispatch({ type: 'EDIT_DART', index, value, multiplier: m }),
    undo: () => dispatch({ type: 'UNDO' }),
    newMatch: () => dispatch({ type: 'NEW_MATCH' }),
  };
}
