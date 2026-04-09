import type { Dart, GameSettings, GameState, Player } from './types';

const START_SCORE = 501;

export function getNextPlayer(current: number, playerCount: number): number {
  return (current + 1) % playerCount;
}

export function calculateDartScore(
  baseValue: number,
  multiplier: 'S' | 'D' | 'T'
): { value: number; isDoubleOrBull: boolean } {
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

export function isBust(newRemaining: number, isDoubleOrBull: boolean): boolean {
  return newRemaining < 0 || newRemaining === 1 || (newRemaining === 0 && !isDoubleOrBull);
}

export function isWin(newRemaining: number, isDoubleOrBull: boolean): boolean {
  return newRemaining === 0 && isDoubleOrBull;
}

export function createInitialPlayers(names: string[], count: number): Player[] {
  return Array.from({ length: count }, (_, i) => ({
    name: names[i] || `Player ${i + 1}`,
    score: START_SCORE,
    legs: 0,
    sets: 0,
  }));
}

export function replayHistory(
  history: Dart[],
  settings: GameSettings
): Omit<GameState, 'gameStarted' | 'multiplier' | 'settings'> & { players: Player[] } {
  const { playerCount, startScore, legsPerSet, setsToWin } = settings;
  const scores = Array(playerCount).fill(startScore);
  const legs = Array(playerCount).fill(0);
  const sets = Array(playerCount).fill(0);
  const turnStart = Array(playerCount).fill(startScore);
  let currPlayer = 0;
  let currDarts = 0;
  let currRemaining = startScore;
  let msg = "";
  let gameOverFlag = false;
  let matchOverFlag = false;
  let matchWinnerVal: number | null = null;

  for (let i = 0; i < history.length; i++) {
    const d = history[i];

    if (currDarts === 0) {
      turnStart[currPlayer] = scores[currPlayer];
      currRemaining = scores[currPlayer];
    }

    const newRem = currRemaining - d.value;

    if (isBust(newRem, d.isDoubleOrBull)) {
      currRemaining = turnStart[currPlayer];
      scores[currPlayer] = turnStart[currPlayer];
      // Skip remaining darts in this busted turn
      while (i + 1 < history.length &&
        history[i + 1].player === d.player &&
        history[i + 1].turn === d.turn) {
        i++;
      }
      currDarts = 0;
      currPlayer = getNextPlayer(currPlayer, playerCount);
      currRemaining = scores[currPlayer];
      continue;
    }

    if (isWin(newRem, d.isDoubleOrBull)) {
      const newLegs = legs[currPlayer] + 1;
      legs[currPlayer] = newLegs;
      let setWon = false;

      if (newLegs >= legsPerSet) {
        sets[currPlayer] += 1;
        setWon = true;
        if (sets[currPlayer] >= setsToWin) {
          matchOverFlag = true;
          matchWinnerVal = currPlayer;
          gameOverFlag = true;
          msg = `Match winner!`;
          break;
        }
      }

      if (setWon) {
        legs.fill(0);
      }
      scores.fill(startScore);
      turnStart.fill(startScore);
      currRemaining = startScore;
      currDarts = 0;
      currPlayer = getNextPlayer(currPlayer, playerCount);
      continue;
    }

    currRemaining = newRem;
    currDarts++;

    if (currDarts === 3) {
      scores[currPlayer] = currRemaining;
      currDarts = 0;
      currPlayer = getNextPlayer(currPlayer, playerCount);
      currRemaining = scores[currPlayer];
    }
  }

  const players: Player[] = scores.map((score, i) => ({
    name: `Player ${i + 1}`,
    score,
    legs: legs[i],
    sets: sets[i],
  }));

  return {
    players,
    currentPlayer: currPlayer,
    currentRemaining: currRemaining,
    turnStartScore: turnStart[currPlayer],
    dartsThrown: currDarts,
    message: msg,
    gameOver: gameOverFlag,
    matchOver: matchOverFlag,
    matchWinner: matchWinnerVal,
    history,
  };
}
