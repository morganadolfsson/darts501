export interface Player {
  name: string;
  score: number;
  legs: number;
  sets: number;
}

export interface Dart {
  player: number;
  turn: number;
  dart: number; // 1, 2, or 3
  value: number;
  multiplier: 'S' | 'D' | 'T';
  isDoubleOrBull: boolean;
}

export interface GameSettings {
  legsPerSet: number;
  setsToWin: number;
  startScore: number;
  playerCount: number;
  doubleOut: boolean;
}

export interface GameState {
  gameStarted: boolean;
  players: Player[];
  currentPlayer: number;
  currentRemaining: number;
  turnStartScore: number;
  dartsThrown: number;
  multiplier: 'S' | 'D' | 'T';
  message: string;
  gameOver: boolean;
  matchOver: boolean;
  matchWinner: number | null;
  history: Dart[];
  settings: GameSettings;
}

export type GameAction =
  | { type: 'START_GAME'; names: string[]; settings: GameSettings }
  | { type: 'THROW_DART'; baseValue: number; multiplier: 'S' | 'D' | 'T' }
  | { type: 'SET_MULTIPLIER'; multiplier: 'S' | 'D' | 'T' }
  | { type: 'EDIT_DART'; index: number; value: number; multiplier: 'S' | 'D' | 'T' }
  | { type: 'NEW_MATCH' }
  | { type: 'SYNC_STATE'; state: GameState };

export interface Session {
  _id: string;
  code: string;
  settings: GameSettings;
  players: { name: string; userId: string }[];
  gameState: GameState | null;
  createdAt: string;
  updatedAt: string;
}
