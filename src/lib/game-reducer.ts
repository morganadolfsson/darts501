import type { GameState, GameAction, Dart } from './types';
import {
  getNextPlayer,
  calculateDartScore,
  isBust,
  isWin,
  isValidDartValue,
  createInitialPlayers,
  replayHistory,
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
    multiplier: 'S',
    message: '',
    gameOver: false,
    matchOver: false,
    matchWinner: null,
    history: [],
    settings: {
      legsPerSet: 3,
      setsToWin: 1,
      startScore: DEFAULT_START_SCORE,
      playerCount: 2,
      doubleOut: true,
    },
  };
}

function handleThrowDart(state: GameState, baseValue: number, mult: 'S' | 'D' | 'T'): GameState {
  if (!state.gameStarted || state.gameOver || state.matchOver) return state;
  if (state.dartsThrown >= 3) return state;

  const { value: scoreValue, isDoubleOrBull } = calculateDartScore(baseValue, mult);
  const { currentPlayer, history } = state;
  const turnNum = Math.floor(
    history.filter(h => h.player === currentPlayer).length / 3
  ) + 1;
  const dartNum = (state.dartsThrown % 3) + 1;

  const newDart: Dart = {
    player: currentPlayer,
    turn: turnNum,
    dart: dartNum,
    value: scoreValue,
    multiplier: mult,
    isDoubleOrBull,
  };

  const newRemaining = state.currentRemaining - scoreValue;
  const newHistory = [...history, newDart];

  const { doubleOut } = state.settings;

  if (isBust(newRemaining, isDoubleOrBull, doubleOut)) {
    return handleBust(state, newHistory);
  }

  if (isWin(newRemaining, isDoubleOrBull, doubleOut)) {
    return handleWin(state, newHistory);
  }

  return handleNormalDart(state, newRemaining, newHistory);
}

function handleBust(state: GameState, newHistory: Dart[]): GameState {
  const { settings, players, currentPlayer } = state;
  const nextPlayer = getNextPlayer(currentPlayer, settings.playerCount);
  const bustMessage = "Bust! No score for this turn.";

  return {
    ...state,
    history: newHistory,
    message: bustMessage,
    currentPlayer: nextPlayer,
    currentRemaining: players[nextPlayer].score,
    turnStartScore: players[nextPlayer].score,
    dartsThrown: 0,
  };
}

function handleWin(state: GameState, newHistory: Dart[]): GameState {
  const { settings, players, currentPlayer } = state;
  const winner = players[currentPlayer];
  const newLegs = winner.legs + 1;
  let newSets = winner.sets;
  let setWon = false;
  let isMatchOver = false;
  let winMessage = "";

  if (newLegs >= settings.legsPerSet) {
    newSets = winner.sets + 1;
    setWon = true;
    if (newSets >= settings.setsToWin) {
      isMatchOver = true;
      winMessage = `${winner.name} wins the match!`;
    } else {
      winMessage = `${winner.name} wins the set! Starting new set...`;
    }
  } else {
    winMessage = `${winner.name} wins the leg!`;
  }

  const updatedPlayers = players.map((p, i) => ({
    ...p,
    score: settings.startScore,
    legs: setWon ? 0 : (i === currentPlayer ? newLegs : p.legs),
    sets: i === currentPlayer ? newSets : p.sets,
  }));

  const nextPlayer = isMatchOver
    ? currentPlayer
    : getNextPlayer(currentPlayer, settings.playerCount);

  return {
    ...state,
    players: updatedPlayers,
    history: newHistory,
    message: winMessage,
    currentPlayer: nextPlayer,
    currentRemaining: settings.startScore,
    turnStartScore: settings.startScore,
    dartsThrown: 0,
    gameOver: isMatchOver,
    matchOver: isMatchOver,
    matchWinner: isMatchOver ? currentPlayer : null,
  };
}

function handleNormalDart(state: GameState, newRemaining: number, newHistory: Dart[]): GameState {
  const { settings, players, currentPlayer } = state;
  const newDartsThrown = state.dartsThrown + 1;

  if (newDartsThrown === 3) {
    const updatedPlayers = players.map((p, i) =>
      i === currentPlayer ? { ...p, score: newRemaining } : p
    );
    const nextPlayer = getNextPlayer(currentPlayer, settings.playerCount);

    return {
      ...state,
      players: updatedPlayers,
      history: newHistory,
      message: '',
      currentPlayer: nextPlayer,
      currentRemaining: updatedPlayers[nextPlayer].score,
      turnStartScore: updatedPlayers[nextPlayer].score,
      dartsThrown: 0,
    };
  }

  return {
    ...state,
    history: newHistory,
    currentRemaining: newRemaining,
    dartsThrown: newDartsThrown,
  };
}

function handleEditDart(state: GameState, index: number, value: number, mult: 'S' | 'D' | 'T'): GameState {
  if (index < 0 || index >= state.history.length) return state;
  if (!isValidDartValue(value, mult)) return state;

  const newHistory = [...state.history];
  newHistory[index] = {
    ...newHistory[index],
    value,
    multiplier: mult,
    isDoubleOrBull: mult === 'D' || (value === 50),
  };

  const replayed = replayHistory(newHistory, state.settings);
  const playerNames = state.players.map(p => p.name);

  return {
    ...state,
    ...replayed,
    players: replayed.players.map((p, i) => ({
      ...p,
      name: playerNames[i] || p.name,
    })),
    history: newHistory,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const players = createInitialPlayers(action.names, action.settings.playerCount, action.settings.startScore);
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
      return handleThrowDart(state, action.baseValue, action.multiplier);
    case 'SET_MULTIPLIER':
      return { ...state, multiplier: action.multiplier };
    case 'EDIT_DART':
      return handleEditDart(state, action.index, action.value, action.multiplier);
    case 'NEW_MATCH':
      return initialGameState();
    case 'SYNC_STATE':
      return action.state;
    default:
      return state;
  }
}
