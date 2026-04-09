import { useReducer } from 'react';
import { gameReducer, initialGameState } from '../lib/game-reducer';
import type { GameSettings, GameState } from '../lib/types';

export function useGame(initial?: GameState) {
  const [state, dispatch] = useReducer(gameReducer, initial ?? initialGameState());

  const startGame = (names: string[], settings: GameSettings) => {
    dispatch({ type: 'START_GAME', names, settings });
  };

  const throwDart = (baseValue: number, multiplier: 'S' | 'D' | 'T') => {
    dispatch({ type: 'THROW_DART', baseValue, multiplier });
  };

  const setMultiplier = (multiplier: 'S' | 'D' | 'T') => {
    dispatch({ type: 'SET_MULTIPLIER', multiplier });
  };

  const editDart = (index: number, value: number, multiplier: 'S' | 'D' | 'T') => {
    dispatch({ type: 'EDIT_DART', index, value, multiplier });
  };

  const newMatch = () => {
    dispatch({ type: 'NEW_MATCH' });
  };

  const syncState = (newState: GameState) => {
    dispatch({ type: 'SYNC_STATE', state: newState });
  };

  return { state, dispatch, startGame, throwDart, setMultiplier, editDart, newMatch, syncState };
}
