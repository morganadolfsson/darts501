// Standard 501/301 checkout calculator.
// Algorithm:
//   1) 1-dart finish: must be a double (D1..D20 → 2..40 even) or Bull (50).
//      In rookie mode (doubleOut = false), any S1..S20 / 25 / 50 also wins.
//   2) 2-dart finish: setup dart (any legal throw) + 1-dart finish for the remainder.
//      Prefer ending on a "good" double (D20/D16/D18/D12/D14/D8/D10/D4/D6/D2/Bull),
//      and prefer single-segment setups over triples when both work
//      (e.g., 121 → T20, S11, Bull rather than T20, T7, D20).
//   3) 3-dart finish: setup dart + 2-dart finish for the remainder.
//      Highest-scoring setup first (T20, T19, T18 …), then Bull, Outer Bull, singles.
//   In double-out mode we never leave 1 (would bust on the next throw).

type Dart = { label: string; value: number; isDouble: boolean };

const PREFERRED_FINISH_DOUBLES: number[] = [20, 16, 18, 12, 14, 8, 10, 4, 6, 2, 17, 19, 15, 13, 11, 9, 7, 5, 3, 1];

const FINISH_OPTIONS: Dart[] = [
  ...PREFERRED_FINISH_DOUBLES.map(n => ({ label: `D${n}`, value: 2 * n, isDouble: true })),
  { label: 'Bull', value: 50, isDouble: true },
];

function singleDartByValue(v: number, allowDouble: boolean): Dart | null {
  if (v <= 0) return null;
  if (v === 50) return { label: 'Bull', value: 50, isDouble: true };
  if (v === 25) return { label: 'Outer Bull', value: 25, isDouble: false };
  if (v >= 1 && v <= 20) return { label: `${v}`, value: v, isDouble: false };
  if (v >= 3 && v <= 60 && v % 3 === 0) return { label: `T${v / 3}`, value: v, isDouble: false };
  if (allowDouble && v >= 2 && v <= 40 && v % 2 === 0) return { label: `D${v / 2}`, value: v, isDouble: true };
  return null;
}

function oneDartCheckout(score: number, doubleOut: boolean): string | null {
  if (!doubleOut) {
    if (score >= 1 && score <= 20) return `${score}`;
    if (score === 25) return 'Outer Bull';
  }
  if (score === 50) return 'Bull';
  if (score >= 2 && score <= 40 && score % 2 === 0) return `D${score / 2}`;
  return null;
}

function twoDartCheckout(score: number, doubleOut: boolean): string | null {
  // Try each preferred finish; setup must be a single segment (no double) to match pro intent.
  for (const finish of FINISH_OPTIONS) {
    const setupValue = score - finish.value;
    if (setupValue < 1) continue;
    const setup = singleDartByValue(setupValue, false);
    if (setup) return `${setup.label}, ${finish.label}`;
  }
  if (!doubleOut) {
    // Rookie mode: any single-value finish works.
    for (let v = 1; v <= 20; v++) {
      const setupValue = score - v;
      if (setupValue < 1) continue;
      const setup = singleDartByValue(setupValue, false);
      if (setup) return `${setup.label}, ${v}`;
    }
    if (score - 25 >= 1) {
      const setup = singleDartByValue(score - 25, false);
      if (setup) return `${setup.label}, Outer Bull`;
    }
    if (score - 50 >= 1) {
      const setup = singleDartByValue(score - 50, false);
      if (setup) return `${setup.label}, Bull`;
    }
  }
  return null;
}

const SETUP_DARTS: Dart[] = (() => {
  const list: Dart[] = [];
  for (let n = 20; n >= 1; n--) list.push({ label: `T${n}`, value: 3 * n, isDouble: false });
  list.push({ label: 'Bull', value: 50, isDouble: true });
  list.push({ label: 'Outer Bull', value: 25, isDouble: false });
  for (let n = 20; n >= 1; n--) list.push({ label: `${n}`, value: n, isDouble: false });
  for (let n = 20; n >= 1; n--) list.push({ label: `D${n}`, value: 2 * n, isDouble: true });
  return list;
})();

function threeDartCheckout(score: number, doubleOut: boolean): string | null {
  for (const setup of SETUP_DARTS) {
    const remaining = score - setup.value;
    if (remaining < 2) continue;
    if (doubleOut && remaining === 1) continue;
    const sub = twoDartCheckout(remaining, doubleOut);
    if (sub) return `${setup.label}, ${sub}`;
  }
  return null;
}

export function getCheckoutSuggestion(
  remaining: number,
  doubleOut: boolean = true,
  dartsLeft: number = 3,
): string | null {
  if (remaining <= 0) return null;
  if (doubleOut && remaining === 1) return null;
  if (dartsLeft <= 0) return null;

  const one = oneDartCheckout(remaining, doubleOut);
  if (one) return one;
  if (dartsLeft === 1) return null;

  const two = twoDartCheckout(remaining, doubleOut);
  if (two) return two;
  if (dartsLeft === 2) return null;

  return threeDartCheckout(remaining, doubleOut);
}
