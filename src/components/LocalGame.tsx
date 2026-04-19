import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/use-game';
import GameSetup from './GameSetup';
import GameShell from './GameShell';

const DEFAULT_TWEAKS = {
  gifsEnabled: true,
  soundEnabled: true,
  reactionSensitivity: 'generous' as const,
};

export default function LocalGame() {
  const navigate = useNavigate();
  const { state, startGame, throwDart, undo, newMatch } = useGame();
  const [tweaks] = useState(DEFAULT_TWEAKS);

  if (!state.gameStarted) {
    return (
      <div className="app-shell">
        <div className="scan" />
        <GameSetup onStartGame={startGame} onBack={() => navigate('/')} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="scan" />
      <GameShell
        state={state}
        tweaks={tweaks}
        onThrow={throwDart}
        onUndo={undo}
        onNewMatch={newMatch}
        onHome={() => navigate('/')}
      />
    </div>
  );
}
