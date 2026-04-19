import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../hooks/use-session';
import GameSetup from './GameSetup';
import GameShell from './GameShell';

const DEFAULT_TWEAKS = {
  gifsEnabled: true,
  soundEnabled: true,
  reactionSensitivity: 'generous' as const,
};

export default function SessionPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    state,
    sessionCode,
    loading,
    throwDart,
    undo,
    startGame,
    newMatch,
  } = useSession(id!);
  const [tweaks] = useState(DEFAULT_TWEAKS);

  if (loading) {
    return (
      <div className="app-shell">
        <div className="scan" />
        <div className="page" style={{ display: 'grid', placeItems: 'center', minHeight: '60vh', color: 'var(--ink-2)' }}>
          Loading session…
        </div>
      </div>
    );
  }

  if (!state.gameStarted) {
    return (
      <div className="app-shell">
        <div className="scan" />
        <GameSetup onStartGame={startGame} onBack={() => navigate('/')} sessionCode={sessionCode} />
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
        sessionCode={sessionCode}
      />
    </div>
  );
}
