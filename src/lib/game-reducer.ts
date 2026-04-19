import type { GameState, GameAction, Dart, TurnRecord, ReactionEvent, ReactionEventType } from './types';
import {
  getNextPlayer,
  calculateDartScore,
  isBust,
  isWin,
  createInitialPlayers,
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
      legsPerSet: 3,
      setsToWin: 1,
      startScore: DEFAULT_START_SCORE,
      playerCount: 2,
      doubleOut: true,
    },
  };
}

function evt(
  type: ReactionEventType,
  player: number,
  dart?: Dart,
  turn?: TurnRecord,
): ReactionEvent {
  return { type, player, dart, turn, ts: Date.now() };
}

function throwDart(state: GameState, baseValue: number, mult: 'S' | 'D' | 'T'): GameState {
  if (!state.gameStarted || state.gameOver || state.matchOver) return state;
  if (state.dartsThrown >= 3) return state;

  const { value: scoreValue, isDoubleOrBull } = calculateDartScore(baseValue, mult);
  const { currentPlayer } = state;
  const turnNum = state.turns.filter(t => t.player === currentPlayer).length + 1;
  const dartNum = state.dartsThrown + 1;

  const newDart: Dart = {
    player: currentPlayer,
    turn: turnNum,
    dart: dartNum,
    value: scoreValue,
    baseValue,
    multiplier: mult,
    isDoubleOrBull,
  };

  const newTurnDarts = [...state.turnDarts, newDart];
  const newHistory = [...state.history, newDart];
  const newRemaining = state.currentRemaining - scoreValue;
  const { doubleOut } = state.settings;

  const checkoutAttempt = state.currentRemaining <= 170 && state.currentRemaining >= 2;

  // BUST
  if (isBust(newRemaining, isDoubleOrBull, doubleOut)) {
    const players = state.players.map((p, i) => i === currentPlayer ? {
      ...p,
      turnsThrown: p.turnsThrown + 1,
      checkoutAttempts: checkoutAttempt ? p.checkoutAttempts + 1 : p.checkoutAttempts,
    } : p);
    const nextPlayer = getNextPlayer(currentPlayer, state.settings.playerCount);
    const turnRecord: TurnRecord = {
      player: currentPlayer,
      darts: newTurnDarts.map(d => ({ val: d.value, mult: d.multiplier, base: d.baseValue })),
      total: 0,
      bust: true,
    };
    return {
      ...state,
      players,
      history: newHistory,
      turns: [...state.turns, turnRecord],
      turnDarts: [],
      message: 'BUST!',
      messageType: 'bust',
      currentPlayer: nextPlayer,
      currentRemaining: players[nextPlayer].score,
      turnStartScore: players[nextPlayer].score,
      dartsThrown: 0,
      lastEvent: evt('bust', currentPlayer, newDart, turnRecord),
    };
  }

  // WIN (leg / set / match)
  if (isWin(newRemaining, isDoubleOrBull, doubleOut)) {
    const winner = state.players[currentPlayer];
    const newLegs = winner.legs + 1;
    let newSets = winner.sets;
    let setWon = false;
    let isMatchOver = false;
    let msg = `${winner.name} wins the leg!`;
    let evtType: ReactionEventType = 'leg-win';

    if (newLegs >= state.settings.legsPerSet) {
      newSets = winner.sets + 1;
      setWon = true;
      if (newSets >= state.settings.setsToWin) {
        isMatchOver = true;
        msg = `${winner.name} WINS THE MATCH!`;
        evtType = 'match-win';
      } else {
        msg = `${winner.name} takes the set!`;
        evtType = 'set-win';
      }
    }

    const turnTotal = newTurnDarts.reduce((s, d) => s + d.value, 0);

    const players = state.players.map((p, i) => {
      const updated = { ...p, score: state.settings.startScore };
      if (i === currentPlayer) {
        updated.turnsThrown = p.turnsThrown + 1;
        updated.totalScored = p.totalScored + turnTotal;
        updated.highestTurn = Math.max(p.highestTurn, turnTotal);
        updated.legs = setWon ? 0 : newLegs;
        updated.sets = newSets;
        updated.checkoutAttempts = p.checkoutAttempts + 1;
        updated.checkoutHits = p.checkoutHits + 1;
      } else {
        updated.legs = setWon ? 0 : p.legs;
      }
      return updated;
    });

    const nextPlayer = isMatchOver ? currentPlayer : getNextPlayer(currentPlayer, state.settings.playerCount);
    const turnRecord: TurnRecord = {
      player: currentPlayer,
      darts: newTurnDarts.map(d => ({ val: d.value, mult: d.multiplier, base: d.baseValue })),
      total: turnTotal,
      bust: false,
      win: true,
    };

    return {
      ...state,
      players,
      history: newHistory,
      turns: [...state.turns, turnRecord],
      turnDarts: [],
      message: msg,
      messageType: evtType,
      currentPlayer: nextPlayer,
      currentRemaining: state.settings.startScore,
      turnStartScore: state.settings.startScore,
      dartsThrown: 0,
      gameOver: isMatchOver,
      matchOver: isMatchOver,
      matchWinner: isMatchOver ? currentPlayer : null,
      lastEvent: evt(evtType, currentPlayer, newDart, turnRecord),
    };
  }

  // NORMAL
  const newDartsThrown = state.dartsThrown + 1;
  if (newDartsThrown === 3) {
    const turnTotal = newTurnDarts.reduce((s, d) => s + d.value, 0);
    const players = state.players.map((p, i) => i === currentPlayer ? {
      ...p,
      score: newRemaining,
      turnsThrown: p.turnsThrown + 1,
      totalScored: p.totalScored + turnTotal,
      highestTurn: Math.max(p.highestTurn, turnTotal),
      checkoutAttempts: checkoutAttempt ? p.checkoutAttempts + 1 : p.checkoutAttempts,
    } : p);
    const nextPlayer = getNextPlayer(currentPlayer, state.settings.playerCount);
    const turnRecord: TurnRecord = {
      player: currentPlayer,
      darts: newTurnDarts.map(d => ({ val: d.value, mult: d.multiplier, base: d.baseValue })),
      total: turnTotal,
      bust: false,
    };
    let turnEvt: ReactionEventType = 'turn';
    if (turnTotal === 180) turnEvt = '180';
    else if (turnTotal >= 140) turnEvt = 'ton-40';
    else if (turnTotal >= 100) turnEvt = 'ton';
    else if (turnTotal <= 9) turnEvt = 'low';

    return {
      ...state,
      players,
      history: newHistory,
      turns: [...state.turns, turnRecord],
      turnDarts: [],
      message: '',
      messageType: '',
      currentPlayer: nextPlayer,
      currentRemaining: players[nextPlayer].score,
      turnStartScore: players[nextPlayer].score,
      dartsThrown: 0,
      lastEvent: evt(turnEvt, currentPlayer, newDart, turnRecord),
    };
  }

  // mid-turn dart
  let midEvt: ReactionEventType = 'dart';
  if (mult === 'T' && baseValue === 20) midEvt = 't20';
  else if (baseValue === 50 || (baseValue === 25 && mult === 'S')) midEvt = 'bull';
  else if (baseValue === 0) midEvt = 'miss';

  return {
    ...state,
    history: newHistory,
    turnDarts: newTurnDarts,
    currentRemaining: newRemaining,
    dartsThrown: newDartsThrown,
    message: '',
    messageType: '',
    lastEvent: evt(midEvt, currentPlayer, newDart),
  };
}

function undoLastDart(state: GameState): GameState {
  if (state.turnDarts.length === 0) return state;
  const newTurnDarts = state.turnDarts.slice(0, -1);
  const newHistory = state.history.slice(0, -1);
  const removed = state.turnDarts[state.turnDarts.length - 1];
  return {
    ...state,
    turnDarts: newTurnDarts,
    history: newHistory,
    dartsThrown: state.dartsThrown - 1,
    currentRemaining: state.currentRemaining + removed.value,
    message: '',
    messageType: '',
    lastEvent: null,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const players = createInitialPlayers(
        action.names,
        action.avatars,
        action.taglines,
        action.settings.playerCount,
        action.settings.startScore,
      );
      return {
        ...initialGameState(),
        gameStarted: true,
        players,
        settings: action.settings,
        currentRemaining: action.settings.startScore,
        turnStartScore: action.settings.startScore,
      };
    }
    case 'THROW_DART':
      return throwDart(state, action.baseValue, action.multiplier);
    case 'SET_MULTIPLIER':
      return { ...state, multiplier: action.multiplier };
    case 'EDIT_DART':
      // Legacy action — not used in the new Dartboard UI. Prefer UNDO instead.
      return state;
    case 'UNDO':
      return undoLastDart(state);
    case 'NEW_MATCH':
      return initialGameState();
    case 'SYNC_STATE':
      return action.state;
    default:
      return state;
  }
}
