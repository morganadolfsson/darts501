// Drop this into src/lib/types.ts — additions to existing Player & GameState
// Changes from original: added avatar, tagline, and stats fields to Player
// Added turns[] and lastEvent to GameState for reactions engine

export interface Player {
  name: string;
  avatar: string;          // emoji string, e.g. '🔥'
  tagline: string;         // walk-on quote
  score: number;
  legs: number;
  sets: number;
  turnsThrown: number;
  totalScored: number;     // sum of turn totals (completed turns)
  highestTurn: number;
  checkoutAttempts: number;
  checkoutHits: number;
}

export interface Dart {
  player: number;
  turn: number;
  dart: number;
  value: number;
  baseValue: number;
  multiplier: 'S' | 'D' | 'T';
  isDoubleOrBull: boolean;
}

export interface TurnRecord {
  player: number;
  darts: { val: number; mult: 'S' | 'D' | 'T'; base: number }[];
  total: number;
  bust: boolean;
  win?: boolean;
}

export type ReactionEventType =
  | '180' | 'ton-40' | 'ton' | 't20' | 'bull'
  | 'miss' | 'low' | 'bust'
  | 'leg-win' | 'set-win' | 'match-win'
  | 'dart' | 'turn' | 'streak';

export interface ReactionEvent {
  type: ReactionEventType;
  player: number;
  dart?: Dart;
  turn?: TurnRecord;
  ts: number;
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
  turnDarts: Dart[];
  multiplier: 'S' | 'D' | 'T';
  message: string;
  messageType: string;
  gameOver: boolean;
  matchOver: boolean;
  matchWinner: number | null;
  history: Dart[];
  turns: TurnRecord[];
  lastEvent: ReactionEvent | null;
  settings: GameSettings;
}

export type GameAction =
  | { type: 'START_GAME'; names: string[]; avatars: string[]; taglines: string[]; settings: GameSettings }
  | { type: 'THROW_DART'; baseValue: number; multiplier: 'S' | 'D' | 'T' }
  | { type: 'SET_MULTIPLIER'; multiplier: 'S' | 'D' | 'T' }
  | { type: 'EDIT_DART'; index: number; value: number; multiplier: 'S' | 'D' | 'T' }
  | { type: 'UNDO' }
  | { type: 'NEW_MATCH' }
  | { type: 'SYNC_STATE'; state: GameState };

export interface Session {
  _id: string;
  code: string;
  settings: GameSettings;
  players: { name: string; userId: string; avatar?: string; tagline?: string }[];
  gameState: GameState | null;
  createdAt: string;
  updatedAt: string;
}
