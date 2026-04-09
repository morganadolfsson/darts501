import type { GameState } from '../lib/types';

interface Props {
  state: GameState;
  onNewMatch: () => void;
}

export default function GameOver({ state, onNewMatch }: Props) {
  if (!state.gameOver && !state.matchOver) return null;

  return (
    <button className="new-game-btn stylish-btn" onClick={onNewMatch}>
      New Match
    </button>
  );
}
