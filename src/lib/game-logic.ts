import type { Dart, GameSettings, Player } from './types';

const START_SCORE = 501;

export function getNextPlayer(current: number, playerCount: number): number {
  return (current + 1) % playerCount;
}

export function calculateDartScore(
  baseValue: number,
  multiplier: 'S' | 'D' | 'T'
): { value: number; isDoubleOrBull: boolean } {
  if (baseValue === 25 && multiplier === 'S') return { value: 25, isDoubleOrBull: false };
  if (baseValue === 50) return { value: 50, isDoubleOrBull: true };
  if (multiplier === 'D') return { value: baseValue * 2, isDoubleOrBull: true };
  if (multiplier === 'T') return { value: baseValue * 3, isDoubleOrBull: false };
  return { value: baseValue, isDoubleOrBull: false };
}

export function isValidDartValue(value: number, multiplier: 'S' | 'D' | 'T'): boolean {
  if (value === 25 && multiplier === 'S') return true;
  if (value === 50 && multiplier === 'D') return true;
  const base = multiplier === 'D' ? value / 2 : multiplier === 'T' ? value / 3 : value;
  return Number.isInteger(base) && base >= 0 && base <= 20;
}

export function isBust(newRemaining: number, isDoubleOrBull: boolean, doubleOut = true): boolean {
  if (newRemaining < 0) return true;
  if (doubleOut && newRemaining === 1) return true;
  if (newRemaining === 0 && doubleOut && !isDoubleOrBull) return true;
  return false;
}

export function isWin(newRemaining: number, isDoubleOrBull: boolean, doubleOut = true): boolean {
  if (newRemaining !== 0) return false;
  return doubleOut ? isDoubleOrBull : true;
}

export function createInitialPlayers(
  names: string[],
  avatars: string[],
  taglines: string[],
  count: number,
  startScore = START_SCORE,
): Player[] {
  return Array.from({ length: count }, (_, i) => ({
    name: names[i] || `Player ${i + 1}`,
    avatar: avatars[i] || '🎯',
    tagline: taglines[i] || '',
    score: startScore,
    legs: 0,
    sets: 0,
    turnsThrown: 0,
    totalScored: 0,
    highestTurn: 0,
    checkoutAttempts: 0,
    checkoutHits: 0,
  }));
}

// Retained only so older imports don't break type-checks. Unused in the new UI.
export function replayHistory(
  history: Dart[],
  settings: GameSettings,
): { players: Player[]; currentPlayer: number; currentRemaining: number; turnStartScore: number; dartsThrown: number; gameOver: boolean; matchOver: boolean; matchWinner: number | null } {
  const { playerCount, startScore, legsPerSet, setsToWin, doubleOut } = settings;
  const players = Array.from({ length: playerCount }, (_, i) => ({
    name: `Player ${i + 1}`, avatar: '🎯', tagline: '',
    score: startScore, legs: 0, sets: 0,
    turnsThrown: 0, totalScored: 0, highestTurn: 0,
    checkoutAttempts: 0, checkoutHits: 0,
  }));
  const turnStart = Array(playerCount).fill(startScore);
  let currPlayer = 0, currDarts = 0, currRemaining = startScore;
  let gameOverFlag = false, matchOverFlag = false;
  let matchWinnerVal: number | null = null;

  for (let i = 0; i < history.length; i++) {
    const d = history[i];
    if (currDarts === 0) { turnStart[currPlayer] = players[currPlayer].score; currRemaining = players[currPlayer].score; }
    const newRem = currRemaining - d.value;
    if (isBust(newRem, d.isDoubleOrBull, doubleOut)) {
      currRemaining = turnStart[currPlayer];
      players[currPlayer].score = turnStart[currPlayer];
      while (i + 1 < history.length && history[i + 1].player === d.player && history[i + 1].turn === d.turn) i++;
      currDarts = 0; currPlayer = getNextPlayer(currPlayer, playerCount);
      currRemaining = players[currPlayer].score; continue;
    }
    if (isWin(newRem, d.isDoubleOrBull, doubleOut)) {
      players[currPlayer].legs += 1;
      let setWon = false;
      if (players[currPlayer].legs >= legsPerSet) {
        players[currPlayer].sets += 1; setWon = true;
        if (players[currPlayer].sets >= setsToWin) {
          matchOverFlag = true; matchWinnerVal = currPlayer; gameOverFlag = true; break;
        }
      }
      if (setWon) players.forEach(p => { p.legs = 0; });
      players.forEach(p => { p.score = startScore; });
      turnStart.fill(startScore); currRemaining = startScore; currDarts = 0;
      currPlayer = getNextPlayer(currPlayer, playerCount); continue;
    }
    currRemaining = newRem; currDarts++;
    if (currDarts === 3) {
      players[currPlayer].score = currRemaining; currDarts = 0;
      currPlayer = getNextPlayer(currPlayer, playerCount);
      currRemaining = players[currPlayer].score;
    }
  }

  return {
    players,
    currentPlayer: currPlayer,
    currentRemaining: currRemaining,
    turnStartScore: turnStart[currPlayer],
    dartsThrown: currDarts,
    gameOver: gameOverFlag,
    matchOver: matchOverFlag,
    matchWinner: matchWinnerVal,
  };
}
