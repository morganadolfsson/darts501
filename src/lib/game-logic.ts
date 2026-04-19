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
