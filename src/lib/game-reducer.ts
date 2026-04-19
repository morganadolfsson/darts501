// Drop into src/lib/game-reducer.ts — replaces the original.
// Expanded to track turn records, stats and reaction events.

import type { GameState, GameAction, Dart, TurnRecord, ReactionEventType, Player } from './types';
import {
  getNextPlayer, calculateDartScore, isBust, isWin,
} from './game-logic';

const DEFAULT_START_SCORE = 501;

export function initialGameState(): GameState {
  return {
    gameStarted: false,
    players: [],
    currentPlayer: 0,
    currentRemaining: DEFAULT_START_SCORE,
    turnStartScore: DEFAULT_START_SCORE,
    dartsThrown: 0,
    turnDarts: [],
    multiplier: 'S',
    message: '',
    messageType: '',
    gameOver: false,
    matchOver: false,
    matchWinner: null,
    history: [],
    turns: [],
    lastEvent: null,
    settings: {
      legsPerSet: 3, setsToWin: 1,
      startScore: DEFAULT_START_SCORE,
      playerCount: 2, doubleOut: true,
    },
  };
}

function createPlayers(names: string[], avatars: string[], taglines: string[], count: number, startScore: number): Player[] {
  return Array.from({ length: count }, (_, i) => ({
    name: names[i] || `Player ${i + 1}`,
    avatar: avatars[i] || '🎯',
    tagline: taglines[i] || '',
    score: startScore, legs: 0, sets: 0,
    turnsThrown: 0, totalScored: 0, highestTurn: 0,
    checkoutAttempts: 0, checkoutHits: 0,
  }));
}

function handleThrow(state: GameState, baseValue: number, mult: 'S' | 'D' | 'T'): GameState {
  if (!state.gameStarted || state.gameOver || state.matchOver) return state;
  if (state.dartsThrown >= 3) return state;

  const { value: scoreValue, isDoubleOrBull } = calculateDartScore(baseValue, mult);
  const { currentPlayer } = state;
  const turnNum = state.turns.filter(t => t.player === currentPlayer).length + 1;

  const newDart: Dart = {
    player: currentPlayer, turn: turnNum, dart: state.dartsThrown + 1,
    value: scoreValue, baseValue, multiplier: mult, isDoubleOrBull,
  };

  const newTurnDarts = [...state.turnDarts, newDart];
  const newHistory = [...state.history, newDart];
  const newRemaining = state.currentRemaining - scoreValue;
  const { doubleOut } = state.settings;
  const checkoutAttempt = state.currentRemaining <= 170 && state.currentRemaining >= 2;

  if (isBust(newRemaining, isDoubleOrBull, doubleOut)) {
    const players = state.players.map((p, i) => i === currentPlayer ? {
      ...p, turnsThrown: p.turnsThrown + 1,
      checkoutAttempts: checkoutAttempt ? p.checkoutAttempts + 1 : p.checkoutAttempts,
    } : p);
    const nextPlayer = getNextPlayer(currentPlayer, state.settings.playerCount);
    const turn: TurnRecord = { player: currentPlayer, darts: newTurnDarts.map(d => ({ val: d.value, mult: d.multiplier, base: d.baseValue })), total: 0, bust: true };
    return {
      ...state, players, history: newHistory,
      turns: [...state.turns, turn], turnDarts: [],
      message: 'BUST!', messageType: 'bust',
      currentPlayer: nextPlayer,
      currentRemaining: players[nextPlayer].score,
      turnStartScore: players[nextPlayer].score,
      dartsThrown: 0,
      lastEvent: { type: 'bust', player: currentPlayer, dart: newDart, turn, ts: Date.now() },
    };
  }

  if (isWin(newRemaining, isDoubleOrBull, doubleOut)) {
    const winner = state.players[currentPlayer];
    const newLegs = winner.legs + 1;
    let newSets = winner.sets;
    let setWon = false, isMatchOver = false;
    let evt: ReactionEventType = 'leg-win';
    let msg = `${winner.name} wins the leg!`;
    if (newLegs >= state.settings.legsPerSet) {
      newSets = winner.sets + 1; setWon = true;
      if (newSets >= state.settings.setsToWin) {
        isMatchOver = true; evt = 'match-win'; msg = `${winner.name} WINS THE MATCH!`;
      } else {
        evt = 'set-win'; msg = `${winner.name} takes the set!`;
      }
    }
    const turnTotal = newTurnDarts.reduce((s, d) => s + d.value, 0);
    const players = state.players.map((p, i) => {
      const u: Player = { ...p, score: state.settings.startScore };
      if (i === currentPlayer) {
        u.turnsThrown = p.turnsThrown + 1;
        u.totalScored = p.totalScored + turnTotal;
        u.highestTurn = Math.max(p.highestTurn, turnTotal);
        u.legs = setWon ? 0 : newLegs; u.sets = newSets;
        u.checkoutAttempts = p.checkoutAttempts + 1;
        u.checkoutHits = p.checkoutHits + 1;
      } else {
        u.legs = setWon ? 0 : p.legs;
      }
      return u;
    });
    const nextPlayer = isMatchOver ? currentPlayer : getNextPlayer(currentPlayer, state.settings.playerCount);
    const turn: TurnRecord = { player: currentPlayer, darts: newTurnDarts.map(d => ({ val: d.value, mult: d.multiplier, base: d.baseValue })), total: turnTotal, bust: false, win: true };
    return {
      ...state, players, history: newHistory, turns: [...state.turns, turn], turnDarts: [],
      message: msg, messageType: evt,
      currentPlayer: nextPlayer,
      currentRemaining: state.settings.startScore,
      turnStartScore: state.settings.startScore,
      dartsThrown: 0, gameOver: isMatchOver, matchOver: isMatchOver,
      matchWinner: isMatchOver ? currentPlayer : null,
      lastEvent: { type: evt, player: currentPlayer, dart: newDart, turn, ts: Date.now() },
    };
  }

  const newDartsThrown = state.dartsThrown + 1;
  if (newDartsThrown === 3) {
    const turnTotal = newTurnDarts.reduce((s, d) => s + d.value, 0);
    const players = state.players.map((p, i) => i === currentPlayer ? {
      ...p, score: newRemaining, turnsThrown: p.turnsThrown + 1,
      totalScored: p.totalScored + turnTotal,
      highestTurn: Math.max(p.highestTurn, turnTotal),
      checkoutAttempts: checkoutAttempt ? p.checkoutAttempts + 1 : p.checkoutAttempts,
    } : p);
    const nextPlayer = getNextPlayer(currentPlayer, state.settings.playerCount);
    const turn: TurnRecord = { player: currentPlayer, darts: newTurnDarts.map(d => ({ val: d.value, mult: d.multiplier, base: d.baseValue })), total: turnTotal, bust: false };
    let evt: ReactionEventType = 'turn';
    if (turnTotal === 180) evt = '180';
    else if (turnTotal >= 140) evt = 'ton-40';
    else if (turnTotal >= 100) evt = 'ton';
    else if (turnTotal <= 9) evt = 'low';
    return {
      ...state, players, history: newHistory, turns: [...state.turns, turn], turnDarts: [],
      message: '', messageType: '',
      currentPlayer: nextPlayer,
      currentRemaining: players[nextPlayer].score,
      turnStartScore: players[nextPlayer].score,
      dartsThrown: 0,
      lastEvent: { type: evt, player: currentPlayer, dart: newDart, turn, ts: Date.now() },
    };
  }

  let evt: ReactionEventType = 'dart';
  if (mult === 'T' && baseValue === 20) evt = 't20';
  else if (baseValue === 50 || (baseValue === 25 && mult === 'S')) evt = 'bull';
  else if (baseValue === 0) evt = 'miss';

  return {
    ...state, history: newHistory, turnDarts: newTurnDarts,
    currentRemaining: newRemaining, dartsThrown: newDartsThrown,
    message: '', messageType: '',
    lastEvent: { type: evt, player: currentPlayer, dart: newDart, ts: Date.now() },
  };
}

function handleUndo(state: GameState): GameState {
  if (state.turnDarts.length === 0) return state;
  const newTurnDarts = state.turnDarts.slice(0, -1);
  const newHistory = state.history.slice(0, -1);
  const removed = state.turnDarts[state.turnDarts.length - 1];
  return {
    ...state, turnDarts: newTurnDarts, history: newHistory,
    dartsThrown: state.dartsThrown - 1,
    currentRemaining: state.currentRemaining + removed.value,
    message: '', messageType: '', lastEvent: null,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const players = createPlayers(action.names, action.avatars, action.taglines, action.settings.playerCount, action.settings.startScore);
      return {
        ...initialGameState(),
        gameStarted: true, players, settings: action.settings,
        currentRemaining: action.settings.startScore,
        turnStartScore: action.settings.startScore,
      };
    }
    case 'THROW_DART': return handleThrow(state, action.baseValue, action.multiplier);
    case 'SET_MULTIPLIER': return { ...state, multiplier: action.multiplier };
    case 'UNDO': return handleUndo(state);
    case 'NEW_MATCH': return initialGameState();
    case 'SYNC_STATE': return action.state;
    default: return state;
  }
}
